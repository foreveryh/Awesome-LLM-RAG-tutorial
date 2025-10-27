Title: Hybrid search with PostgreSQL and pgvector

URL Source: https://jkatz05.com/post/postgres/hybrid-search-postgres-pgvector/

Published Time: 2024-09-16T00:00:00+00:00

Markdown Content:
*   Mon, Sep 16, 2024
*   14-minute read

[A key metric when evaluating vector similarity search algorithms](https://jkatz05.com/post/postgres/pgvector-performance-150x-speedup/) is “[recall](https://en.wikipedia.org/wiki/Precision_and_recall)” - which measures the relevancy of the returned search results. Typically better recall means better quality search results, but this is often at the cost of another key metric, such as index size or query latency. This has led to different techniques to “boost” recall while trying to limited any adverse impact to other metrics. There are a variety of techniques available for this, such as using different storage and search strategies to overcompensate for a key metric tradeoff. For example, quantization techniques can cause information loss when reducing the size of a vector, but using statistical quantization can help improve results in some cases.

One technique used to boost recall is “hybrid search.” Hybrid search is the act of combining an alternative searching method with a vector similarity search. This blog post will introduce what hybrid search is and how to use it with [PostgreSQL](https://www.postgresql.org/) and [pgvector](https://github.com/pgvector/pgvector/). In a future post, I plan to demonstrate the impact of hybrid search on the five key vector search metrics (index build time, index size, recall, query latency, QPS), but I haven’t seen or established a [ground truth](https://en.wikipedia.org/wiki/Ground_truth) set that can help establish that benchmark.

What is hybrid search?
----------------------

As mentioned above, in the context of vector search, “hybrid search” is the act of combining an alternative searching method with a vector similarity search. Hybrid search uses multiple search methods over the same data, performs a ranking of the results for each search method, and then combines all the results to determine a final ranking before returning the results. Hybrid search is often used to improve the quality of the returned results, or in other words, boost the “recall” rate.

There are a variety of methods used to score the results, with [reciprocal ranked fusion](https://en.wikipedia.org/wiki/Mean_reciprocal_rank) (RRF) being very popular. For ranked your search results (e.g., 1, 2, 3), RRF provides a weighted scoring system that lets you define how much a higher-ranked item (1 is ranked higher than 2) counts towards the final score. You can control weighting using a constant typically referred to as `k`, though this can be understandably confusing given vector similarity search uses `k` to mean “k-nearest neighbor”. For this blog post, we’ll call it `rrf_k`. To calculate RRF for a hybrid search with two different search methods, you’d use the below formula:

```
1.0 / (result_search_1_rank + rrf_k) +
1.0 / (result_search_2_rank + rrf_k)
```

where `result_search_1_rank` is the rank of the result in the first search, and `result_search_2_rank` is the rank of the result from the second search. If a result doesn’t appear in a search, we can return `0` for the score. Below is an example function for calculating an individual RRF score, which we’ll use through the blog post:

```
CREATE OR REPLACE FUNCTION rrf_score(rank bigint, rrf_k int DEFAULT 50)
RETURNS numeric
LANGUAGE SQL
IMMUTABLE PARALLEL SAFE
AS $$
    SELECT COALESCE(1.0 / ($1 + $2), 0.0);
$$;
```

A smaller value of `rrf_k` gives more weight to higher ranked items, whereas a larger value of `rrf_k` gives more weight to lower ranked items. For hybrid search, this impacts the final score when combining the two scores from the search. Below is an example that shows how `rrf_k` impacts the final score on items that have a ranking of 1 to 10; we see how increasing `rrf_k` decreases how much weight a higher ranked score has on the results.

```
SELECT
    results.rrf_k,
    array_agg(results.score) scores
FROM (
    SELECT
        rrf_k,
        round(100 * rrf_score(rank, rrf_k), 2) score
    FROM generate_series(10, 100, 10) rrf_k,
        generate_series(1,10) rank
    ORDER BY rrf_k, rank
) results
GROUP BY results.rrf_k
ORDER BY results.rrf_k;
```

which yields:

```
rrf_k |                       scores                        
-------+-----------------------------------------------------
    10 | {9.09,8.33,7.69,7.14,6.67,6.25,5.88,5.56,5.26,5.00}
    20 | {4.76,4.55,4.35,4.17,4.00,3.85,3.70,3.57,3.45,3.33}
    30 | {3.23,3.13,3.03,2.94,2.86,2.78,2.70,2.63,2.56,2.50}
    40 | {2.44,2.38,2.33,2.27,2.22,2.17,2.13,2.08,2.04,2.00}
    50 | {1.96,1.92,1.89,1.85,1.82,1.79,1.75,1.72,1.69,1.67}
    60 | {1.64,1.61,1.59,1.56,1.54,1.52,1.49,1.47,1.45,1.43}
    70 | {1.41,1.39,1.37,1.35,1.33,1.32,1.30,1.28,1.27,1.25}
    80 | {1.23,1.22,1.20,1.19,1.18,1.16,1.15,1.14,1.12,1.11}
    90 | {1.10,1.09,1.08,1.06,1.05,1.04,1.03,1.02,1.01,1.00}
   100 | {0.99,0.98,0.97,0.96,0.95,0.94,0.93,0.93,0.92,0.91}
```

Our `rrf_score` function defaults to using `50`; you may want to adjust this based your search methods and embedding models (I realize this is a generic statement; a future blog will dive deeper into this topic).

With generative AI use cases, including [retrieval augmented generation](https://aws.amazon.com/what-is/retrieval-augmented-generation/) ([RAG](https://aws.amazon.com/what-is/retrieval-augmented-generation/)), “hybrid search” typically refers to combining vector similarity search with full-text search, given the vector output of many embedding models is based on a text source. Before exploring an example of hybrid search, we’ll first learn how we can use full-text search in PostgreSQL.

[Full-text search in PostgreSQL](https://www.postgresql.org/docs/current/textsearch.html)
-----------------------------------------------------------------------------------------

[PostgreSQL includes several full-text search methods](https://www.postgresql.org/docs/current/textsearch.html), including [tsearch2](https://www.postgresql.org/docs/current/textsearch.html) and [pg_trgm](https://www.postgresql.org/docs/current/pgtrgm.html). Additionally, there are a variety of extensions for PostgreSQL that implement full-text search, including [pg_bigm](https://github.com/pgbigm/pg_bigm), [PGroonga](https://pgroonga.github.io/), [ZomboDB](https://github.com/zombodb/zombodb), [pg_search](https://www.paradedb.com/blog/introducing_search) (based on BM25), and more (please be sure you ensure an extension’s license works for your use case). For the built-in PostgreSQL full-text search methods, there are [two types of indexing methods available](https://www.postgresql.org/docs/current/textsearch-indexes.html): GIN (generalized inverted index) which provides an inverted index search, and GiST (generalized search tree).

Full-text search in PostgreSQL is a multi-part topic unto itself – in fact, I attended a presentation at [PGDay.UK 2024](https://2024.pgday.uk/) on this exact topic! For this blog post, we’re going to use tsearch2 with the GIN index and the `ts_rank_cd` result ranking method. For more information, please see the [PostgreSQL full-text search documentation](https://www.postgresql.org/docs/current/textsearch.html).

With that, let’s see how we can implement hybrid search in PostgreSQL.

Example: building hybrid search in PostgreSQL with full-text search and vector search with pgvector
---------------------------------------------------------------------------------------------------

For this example, I wanted to try to build something out that’s real-worldish. However, I ended generated a bunch of random text data using the Python [`faker`](https://faker.readthedocs.io/en/master/) library, and then computed a vector using the [`multi-qa-MiniLM-L6-cos-v1`](https://huggingface.co/sentence-transformers/multi-qa-MiniLM-L6-cos-v1) sentence transformer model. I don’t particularly like the fact this example is built on “garbage” data that I generated, but as we’ll see, it turned out that using hybrid search actually worked and boosted the expected top result to the number one position!

For this example, you’ll need a PostgreSQL database with pgvector (at least version v0.5; I used v0.7.4) and Python with a few libraries:

*   [`psycopg`](https://www.psycopg.org/psycopg3/)
*   [`pgvector`](https://github.com/pgvector/pgvector-python)
*   [`faker`](https://faker.readthedocs.io/en/master/)
*   [`sentence_transformers`](https://pypi.org/project/sentence-transformers/)

Here is the schema for the example:

```
-- create the extension
CREATE EXTENSION vector;

-- create the schema
CREATE TABLE products (
	id int GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
	description text NOT NULL,
	embedding vector(384) NOT NULL
);
-- helper function for calculating the score
CREATE OR REPLACE FUNCTION rrf_score(rank int, rrf_k int DEFAULT 50)
RETURNS numeric
LANGUAGE SQL
IMMUTABLE PARALLEL SAFE
AS $$
    SELECT COALESCE(1.0 / ($1 + $2), 0.0);
$$ ;
```

* * *

```
from faker import Faker
import psycopg
from pgvector.psycopg import register_vector
from sentence_transformers import SentenceTransformer

# generate random (garbage?) data
fake = Faker()
sentences = [fake.sentence(nb_words=50) for i in range(0,50_000)]

# generate the vector embedding - this may take a few minutes
model = SentenceTransformer('multi-qa-MiniLM-L6-cos-v1')
embeddings = model.encode(sentences)

# load the data into the database
conn = psycopg.connect(dbname="<YOUR DATABASE>", autocommit=True) # fill in with your details
cur = conn.cursor()

with cur.copy("COPY products (description, embedding) FROM STDIN WITH (FORMAT BINARY)") as copy:
	copy.set_types(["text", "vector"])
	for content, embedding in zip(sentences, embeddings):
		copy.write_row((content, embedding))

cur.close()
conn.close()
```

To complete our setup, we’ll create the indexes. While we could have created the indexes on an empty table, this will let us build the indexes more quickly:

```
-- create the full-text search index
CREATE INDEX ON products
    USING GIN (to_tsvector('english', description));
-- create the vector search index (HNSW)
CREATE INDEX ON products
    USING hnsw(embedding vector_cosine_ops) WITH (ef_construction=256);
```

Let’s note two things here. First, notice that the product description is stored as `text`, but the GIN index uses an expression `to_tsvector('english', description)`. The expression index enables us to store the data encoded for full-text search only in the index, instead of having it additionally as a separate column in the table. Additionally, note that we have to specify the dictionary (in this case, `english`) in the function call: we need to use immutable functions in expression indexes, and this ensures that we always use the same dictionary when creating the index.

Now let’s perform some searches. First, I’ll demonstrate how the search work individually, so we can then see how a hybrid search “boosts” our results. In this example, I’ll search for a `travel computer` (which in my randomly generated garbage data, I saw that phrase come up a few times, and I happened to be traveling and working on my computer while building out this example). This is how I generated the vector that embedded `travel computer`:

```
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('multi-qa-MiniLM-L6-cos-v1')
embedding = model.encode('travel computer')
```

First, let’s run the query using a vector similarity search. The vector embedding is represented as `$1` in the below query:

```
SELECT id, description, rank() OVER (ORDER BY $1 <=> embedding) AS rank
FROM products
ORDER BY $1 <=> embedding
LIMIT 10
```

In my dataset, I had the following results (clipped for brevity):

```
id   | description             | rank 
-------+-------------------------+-------
 10578 | ... travel ... computer |    1
 20763 | ... computer ...        |    2
 20894 | ... computer ...        |    3
   838 | Computer ...            |    4
 11045 | ...computer ...         |    5
 18548 | ... travel computer ... |    6
 16564 | ... computer ...        |    7
 20402 | ...computer ...         |    8
 10346 | ... computer ...        |    9
 11243 | ... travel ... computer |   10
```

I’m not going to overanalyze this given all my disclaimers about the data, but it seems like record that should rank the highest (`18548`) is actually ranked sixth. Let’s see what a full-text search produces:

```
SELECT
    id,
    description,
    rank() OVER (ORDER BY ts_rank_cd(to_tsvector(description), plainto_tsquery('travel computer')) DESC) AS rank
FROM products
WHERE
    plainto_tsquery('english', 'travel computer') @@ to_tsvector('english', description)
ORDER BY rank
LIMIT 10;
```

which in my dataset, yielded:

```
id   | description                 | rank 
-------+-----------------------------+------
 18548 | ... travel computer ...     |    1
  7372 | ... travel computer ...     |    1
 49374 | ... travel computer ...     |    1
 39214 | ... travel computer ...     |    1
 12875 | ... computer travel ...     |    1
  3712 | ... travel computer ...     |    1
 24719 | ... travel ... computer ... |    7
 31607 | ... travel ... computer ... |    7
 13674 | ... travel ... computer ... |    7
 42755 | ... computer ... travel ... |    7
```

We can see that the full-text search scoring function ranked `18548` as the top result, along with 6 other entries. This also gives insight into where hybrid search can help us: while a vector similarity search can help us determine the semantic relationship of a search phrase, the phrase itself may not necessarily be present in the search. And while a full-text search can determine if the search phrase is present in the text, it may not determine its overall relevancy across the entire content. Combining the two methods may help us to boost the results.

The below query will let us perform a hybrid search. We’ll target `10` results in this search, but this means we’ll have to search over more results to ensure we have enough overlapping results to compare. For this case, I chose `40`, mainly because the default for `hnsw.ef_search` is 40. To perform our hybrid search, we’ll set up two subqueries: one that performs the vector search, the other that performs the full-text search. Then, in the outer query, we’ll use our `rrf_score` function (with `rrf_k` set to the default of `50`) to sum up the results, and order by the highest score. The search vector is represented by `$1`:

```
SELECT
    searches.id,
    searches.description,
    sum(rrf_score(searches.rank)) AS score
FROM (
	(
		SELECT
            id,
            description,
            rank() OVER (ORDER BY $1 <=> embedding) AS rank
		FROM products
		ORDER BY $1 <=> embedding
		LIMIT 40
	)
	UNION ALL
	(
		SELECT
			id,
            description,
			rank() OVER (ORDER BY ts_rank_cd(to_tsvector(description), plainto_tsquery('travel computer')) DESC) AS rank
		FROM products
		WHERE
			plainto_tsquery('english', 'travel computer') @@ to_tsvector('english', description)
		ORDER BY rank
		LIMIT 40
	)
) searches
GROUP BY searches.id, searches.description
ORDER BY score DESC
LIMIT 10;
```

which yields the following result:

```
id   | description                 |         score          
-------+-----------------------------+------------------------
 18548 | ... travel computer ...     | 0.03746498599439775910
  7372 | ... travel computer ...     | 0.01960784313725490196
 12875 | ... computer travel ...     | 0.01960784313725490196
 10578 | ... travel ... computer ... | 0.01960784313725490196
 39214 | ... travel computer ...     | 0.01960784313725490196
 49374 | ... travel computer ...     | 0.01960784313725490196
  3712 | ... travel computer ...     | 0.01960784313725490196
 20763 | ... computer ...            | 0.01923076923076923077
 20894 | ... computer ...            | 0.01886792452830188679
   838 | Computer ...                | 0.01851851851851851852
```

We can see that in our hybrid search, `18548` has the top RRF score; the other entries that contained “travel computer” tied for 2nd, followed by three of the top 10 semantic search results rounding out the list. Again, I wouldn’t read too much into this given the dataset, but it seems like a hybrid search method has the potential to boost the recall of our result set.

SQL queries like the one above can seem a bit hard to understand at first, so let’s briefly break down how it works. I’ve found the trick to understanding SQL is to work from the inside-out: start from the innermost part of the query and move to the outside.

In our hybrid search query, first we have the two subqueries that we saw before - the vector search query…

```
SELECT
    id,
    description,
    rank() OVER (ORDER BY $1 <=> embedding) AS rank
FROM products
ORDER BY $1 <=> embedding
LIMIT 40
```

and the full-text search query:

```
SELECT
    id,
    description,
    rank() OVER (ORDER BY ts_rank_cd(to_tsvector(description), plainto_tsquery('travel computer')) DESC) AS rank
FROM products
WHERE
    plainto_tsquery('english', 'travel computer') @@ to_tsvector('english', description)
ORDER BY rank
LIMIT 40
```

Each of these queries returns 40 results. We now need a way to combine them, which is what [`UNION ALL`](https://www.postgresql.org/docs/current/queries-union.html) does:

```
(
    SELECT
        id,
        description,
        rank() OVER (ORDER BY $1 <=> embedding) AS rank
    FROM products
    ORDER BY $1 <=> embedding
    LIMIT 40
)
UNION ALL
(
    SELECT
        id,
        description,
        rank() OVER (ORDER BY ts_rank_cd(to_tsvector(description), plainto_tsquery('travel computer')) DESC) AS rank
    FROM products
    WHERE
        plainto_tsquery('english', 'travel computer') @@ to_tsvector('english', description)
    ORDER BY rank
    LIMIT 40
)
```

Now that we’ve combined the two queries, we need to calculate the final score. To do this, we first give our subquery a name - we’ll call it `searches` (`FROM ( ... ) searches`). We then figure out how we’re going to combine or aggregate our results. Recall that `rrf_score` has the ability to handle `NULL` data (`COALESCE(1.0 / ($1 + $2), 0.0)`). This lets us use the `sum` aggregate function to combine results: if a row is found in both subqueries, its scores will be added up, and if a row is only present in one search, its score will be added to `0`. Finally, we have to group by our “unique” identifiers (the row ID and its description), order the results starting with the top score (`ORDER BY score DESC`), and limit our results to `10`. The abbreviated example of this query is below:

```
SELECT
    searches.id,
    searches.description,
    sum(rrf_score(searches.rank)) AS score
FROM (
    -- UNION'd queries
) searches
GROUP BY searches.id, searches.description
ORDER BY score DESC
LIMIT 10;
```

How about performance? As I mentioned at the top of the blog post, I can’t do a rigorous performance analysis here due to the lack of a ground-truth dataset, and this is only a dataset of 50K rows. That said, I’m happy to show the [`EXPLAIN`](https://www.postgresql.org/docs/current/sql-explain.html) plan that was generated. Below is the output of `EXPLAIN ANALYZE` on this query to show that both indexes were used:

```
Limit  (cost=789.66..789.69 rows=10 width=365) (actual time=8.516..8.519 rows=10 loops=1)
   ->  Sort  (cost=789.66..789.86 rows=80 width=365) (actual time=8.515..8.518 rows=10 loops=1)
         Sort Key: (sum(COALESCE((1.0 / (("*SELECT* 1".rank + 50))::numeric), 0.0))) DESC
         Sort Method: top-N heapsort  Memory: 32kB
         ->  GroupAggregate  (cost=785.53..787.93 rows=80 width=365) (actual time=8.435..8.495 rows=79 loops=1)
               Group Key: "*SELECT* 1".id, "*SELECT* 1".description
               ->  Sort  (cost=785.53..785.73 rows=80 width=341) (actual time=8.430..8.436 rows=80 loops=1)
                     Sort Key: "*SELECT* 1".id, "*SELECT* 1".description
                     Sort Method: quicksort  Memory: 53kB
                     ->  Append  (cost=84.60..783.00 rows=80 width=341) (actual time=0.877..8.414 rows=80 loops=1)
                           ->  Subquery Scan on "*SELECT* 1"  (cost=84.60..125.52 rows=40 width=341) (actual time=0.877..0.949 rows=40 loops=1)
                                 ->  Limit  (cost=84.60..125.12 rows=40 width=349) (actual time=0.876..0.945 rows=40 loops=1)
                                       ->  WindowAgg  (cost=84.60..50736.60 rows=50000 width=349) (actual time=0.876..0.942 rows=40 loops=1)
                                             ->  Index Scan using products_embeddings_hnsw_idx on products  (cost=84.60..49861.60 rows=50000 width=341) (actual time=0.872..0.919 rows=40 loops=1)
                                                   Order By: (embedding <=> '<redacted>'::vector)
                           ->  Subquery Scan on "*SELECT* 2"  (cost=656.58..657.08 rows=40 width=341) (actual time=7.448..7.458 rows=40 loops=1)
                                 ->  Limit  (cost=656.58..656.68 rows=40 width=345) (actual time=7.447..7.453 rows=40 loops=1)
                                       ->  Sort  (cost=656.58..656.89 rows=124 width=345) (actual time=7.447..7.449 rows=40 loops=1)
                                             Sort Key: (rank() OVER (?))
                                             Sort Method: top-N heapsort  Memory: 44kB
                                             ->  WindowAgg  (cost=588.18..652.66 rows=124 width=345) (actual time=7.357..7.419 rows=139 loops=1)
                                                   ->  Sort  (cost=588.18..588.49 rows=124 width=337) (actual time=7.355..7.363 rows=139 loops=1)
                                                         Sort Key: (ts_rank_cd(to_tsvector(products_1.description), plainto_tsquery('travel computer'::text))) DESC
                                                         Sort Method: quicksort  Memory: 79kB
                                                         ->  Bitmap Heap Scan on products products_1  (cost=30.38..583.87 rows=124 width=337) (actual time=0.271..7.323 rows=139 loops=1)
                                                               Recheck Cond: ('''travel'' & ''comput'''::tsquery @@ to_tsvector('english'::regconfig, description))
                                                               Heap Blocks: exact=138
                                                               ->  Bitmap Index Scan on products_description_gin_idx  (cost=0.00..30.35 rows=124 width=0) (actual time=0.186..0.186 rows=139 loops=1)
                                                                     Index Cond: (to_tsvector('english'::regconfig, description) @@ '''travel'' & ''comput'''::tsquery)
 Planning Time: 0.193 ms
 Execution Time: 8.553 ms
```

So yes, PostgreSQL used the indexes in both subqueries. I left the execution time in the output, though it doesn’t really mean much given this dataset is so small.

Next steps
----------

The main goal of this blog post was to show how you can use PostgreSQL and pgvector with hybrid search. This answers the “can you” perform hybrid search question, but it doesn’t attempt to answer “should you” - that requires a lot more analysis, and it’s analysis I’m planning to do in a future post. For next steps, I’d like to evaluate if hybrid search can provide a recall boost over just performing vector similarity search over a known dataset, and if so, what are the key metric tradeoffs. Additionally, it’d be good to analyze different full-text search algorithms with PostgreSQL and if/how they can help with boosting result relevancy.
