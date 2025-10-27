Title: SPLADE – a sparse bi-encoder BERT-based model achieves effective and efficient first-stage ranking

URL Source: https://europe.naverlabs.com/blog/splade-a-sparse-bi-encoder-bert-based-model-achieves-effective-and-efficient-first-stage-ranking/

Published Time: 2021-07-08T11:09:16+00:00

Markdown Content:
When you type a query into a search engine, millions of operations occur faster than the blink of an eye. Most search engine architectures use machine-learning-based ranking algorithms. Ranking algorithms have many different components, but the standard pipeline can be seen as a two-stage process involving two models: the ranker (which selects a candidate set of documents) and the reranker (which finds the optimal document order).

### The stages of search: ranking and reranking

An efficient first ranker preselects a candidate set of documents from the billions that exist on the web by means of a term-based model—like BM25—and an inverted index. For a textbook, an inverted index is simply a list that indicates the occurrence of keywords within the text. For web pages, the concept is similar, but for each word in the ‘vocabulary’, a list of documents (or pages) containing that word is stored. This index allows quick access to the documents that contain the query terms, and drastically reduces the cost of retrieval, as we can safely ignore any documents that do not overlap the query. Thus, the basic technology behind a search engine requires detecting and counting words. This results in very high-dimensional sparse vectors (i.e. that have mostly zero values) by nature, as the vocabulary is generally large and documents only contain a small subset of terms.

The second model, called a reranker, is then applied to find the optimal document order for your query from the candidate set. The reranker, which generally involves more computations than the first ranker, is based on classical machine learning models (e.g. gradient boosted trees or neural networks).

### Using BERT to understand natural language for information retrieval

If you follow technology trends in artificial intelligence, you’ve likely encountered the deep-neural-network technology BERT ([1](https://aclanthology.org/N19-1423.pdf))—one of many such models named after muppets—and follow-ups like RoBERTa, ELECTRA and BART. BERT is based on the transformer architecture that models natural language, words, and sentences, and embeds words (and possibly sentences) into a few hundred-dimensional continuous vectors to learn how they are implicitly composed. By doing computations on the vectors, BERT can tackle many natural language processing tasks, including ad hoc information retrieval (IR). Since the beginning of 2019, BERT-based ranking models have been state of the art by a large margin.

In contrast with the term-based sparse vectors that are traditionally used in IR, like tf-IDF (term frequency–inverse document frequency), BERT-like models represent words as continuous or dense vectors, called embeddings, which are latent (i.e. we cannot directly interpret their dimensions). Modeling text with continuous vectors is not novel per se: in the 1990s, latent semantic indexing (LSI) was the first approach to continuous embedding. What is novel and impressive about BERT, however, is the breakthrough performance it provides compared to existing methods.

BERT was initially used as a reranker for IR. Later, though, BERT became the backbone of efficient architectures that tackle first-stage ranking, even competing with standard models (like BM25) that have rarely been challenged over the years.

In first-stage ranking, we need to create an index of the representations created by BERT. To do so, we use ‘approximate nearest neighbouring’ (ANN) techniques ([2](https://ieeexplore.ieee.org/document/8733051)). Imagine that you’re a sailor in the night looking up into a star-studded sky. To find your route, you must first create a map of these stars so that you’re then able to triangulate your position. This is similar to creating an index for BERT continuous vectors. The index is essentially creating appropriate, efficient data structures to search over billions of data points. Fortunately, ANNs—which were originally developed for computer vision—can be directly applied to our scenario.

### Approaches to indexing: dense versus sparse

It is legitimate to wonder whether the traditional way of storing text (i.e. with keyword-based representations, such as inverted indexes) is now obsolete. In practice, current systems use a combination of sparse and continuous vectors to perform search, and there is not yet a clear and definitive answer regarding which is more efficient. Indeed, in recent years an unsettled debate has bubbled away over which—between the sparse (lexical) and dense (semantic) representation—approach to information retrieval is better. They have their own individual advantages and weaknesses and may simply complement each other when used together.

However, there are at least two benefits of sparse representations over dense ones. First, sparse representations make it much easier to interpret how documents are ranked for a given query. Each dimension in the representation corresponds to an actual word (or subword), and sparsity makes it easy to isolate which words contribute to the score. In contrast, interpreting the continuous representations from BERT is much harder. Like most machine-learning models, it acts like a black box and, as such, its output requires more thorough analysis. The second advantage of sparse representations is that integrating new sparse pretrained language models into the search engine infrastructure has no huge additional cost. Although the migration of new models can be limiting in terms of model design, it can be achieved seamlessly.

Given the prevalence of sparse representations in search engines, several research teams wondered whether it was still possible to use an inverted index as the search backbone. For instance, doc2query and doc2query-T5 ([3](https://arxiv.org/abs/1904.08375), [4](https://cs.uwaterloo.ca/~jimmylin/publications/Nogueira_Lin_2019_docTTTTTquery-v2.pdf)) have used pretrained models like BERT either to generate relevant terms for documents or to predict term weights to be used in an inverted index. However, these methods fail to really outperform a simple dense BERT encoder.

Figure 1 gives an overview of the main approaches proposed in the last two years for first-stage document ranking. To tackle the scale of the problem, these approaches rely either on dense representations combined with ANN search or sparse representations combined with an inverted index.

### Our model, SParse Lexical AnD Expansion (SPLADE)

With our approach, we investigate how sparse mechanisms (like query/document expansion) can be taken advantage of. SPLADE follows along the line of research begun by DeepCT in 2019 ([5](https://arxiv.org/abs/1910.10687)), which aimed to learn effective (i.e. BERT-based) and efficient sparse representations for first-stage retrieval. Contrary to previous work, however, our simple approach—trained in a single stage—outperforms a standard dense BERT model, as well as previous sparse approaches, and competes with state-of-the-art dense models which rely on either distillation or advanced sampling strategies.

SPLADE operates directly on sparse high-dimensional vectors (in the vocabulary space) in two ways:

*   **adding new terms**(expansion) and/or **removing existing terms** (compression) from the document/query (in other words, SPLADE learns which terms are important and which ones are missing).
*   **estimating a term importance** (term weighting) for such words, similarly to tf-idf.

The way in which SPLADE represents an input query or document is illustrated in Figure 2. Figure 3 shows an example of the results on an MS MARCO passage document. The model performs term reweighting by emphasizing important terms and discarding most of those without information content. Expansion allows documents to be enriched, either by implicitly adding stemming effects (e.g. ‘legs’ => ‘leg’) or by adding relevant topic words (e.g. ‘treatment’), shown in Figure 3.

Figure 2: Comparison between encoding a query in a (binary) bag-of-words (BOW) fashion, and encoding a query with SPLADE. The two effects of **expansion**and **term weighting** are illustrated with a light blue background and purple text, respectively.

### Learning to match documents and queries with the masked language modeling (MLM) head

Instead of matching documents and queries in the non-interpretable BERT vector space, SPLADE aims to properly match documents and queries by finding the appropriate term (and weights) for the sparse representation. So, how is the model able to learn this mechanism?

At the heart of pretrained language models like BERT is a component called the MLM head. To enable prediction of the correct words in a sentence context, BERT is pretrained on sentences where words have been blanked out. The MLM head is in charge of mapping the latent continuous representations of words back to the full vocabulary. Most work that uses BERT discards this MLM head and readapts only the continuous representations. In our work, we take inspiration from SparTerm and EPIC ([6](https://arxiv.org/abs/2010.00768), [7](https://arxiv.org/abs/2004.14245)) and reuse the MLM head to predict expansion: each word representation from a document/query is mapped to the vocabulary, giving an estimation of the importance implied by the term itself for each vocabulary word. This also means that we work in the BERT vocabulary space with a WordPiece tokenizer (i.e. a space with 30,000 different sub-words, which is much larger than the 768 dimension of BERT embeddings). Our model architecture is illustrated in Figure 4.

### Controlling sparsity with regularization constraints

Unfortunately, representations obtained this way are not sparse enough, so it isn’t immediately possible to build an inverted index. In ([6](https://arxiv.org/abs/2010.00768)), the authors propose using a second model to learn which words to keep in the representations, but it wasn’t possible to do this in an end-to-end manner. In SPLADE, we propose simply adding regularization constraints on representations when training the model. We use the FLOPS regularizer—introduced by Paria et al. in an ICLR 2020 paper) ([8](https://arxiv.org/abs/2004.05665))—in the context of image retrieval, which directly estimates the associated cost of using a sparse representation with an inverted index. Representations are therefore both sparse and spread (i.e. the model tries to fully utilize the output space), which is not the case if we use a standard L1 regularization. Simply speaking, this regularization will penalize words that are often predicted but which are not really useful for retrieving relevant documents. This is useful because, if too many words are added, the lists in the inverted index become too big and latency will increase. Using regularization avoids this by enabling the model to perform a sort of compression by only retaining the most relevant words from a document/query. Examples of representations obtained for documents and queries with SPLADE are given in Tables 1, 2 and 3.

Table 1: SPLADE representations for example MS MARCO dev documents.

Table 2: SPLADE representations for example MS MARCO dev queries. Note that for queries, the compression effect is less strong than for documents, as we cannot afford to lose query terms. The model interestingly learns how to do query expansion. Also note that the mechanism is not perfect: for instance, for the query ‘**what is marilyn manson music called’**, the model expands with ‘tate’, which is a word related to Charles rather than Marilyn Manson.

Table 3: SPLADE representations, using queries from the TREC Robust 2004 dataset, in a zero-shot setting (i.e. the model has not been fine-tuned) show that the model is able to generalize expansion for queries.

An additional benefit of this regularization is that we can control its strength to find the optimal trade-off between performance and efficiency for a given task. To do so, we set a hyperparameter that adjusts the balance between the ranking loss and the regularization loss. Figure 5 shows that we’re able to obtain close to state-of-the-art results, and that we can sacrifice a bit of effectiveness to obtain very efficient models. Note that for the far left SPLADE model (most regularized), the representations are extremely sparse and contain on average 18 terms, whereas the average size of passages in MS MARCO is around 60. Note that we cannot estimate the efficiency of dense approaches with FLOPS. To compare the two approaches, we should resort to measuring query latency or throughput (being aware that these comparisons are intricate, because they very much depend on hardware and other considerations).

### Conclusion and future work

We have developed SPLADE, a new model that learns BERT-based sparse representations for queries and documents to effectively and efficiently retrieve documents by means of an inverted index.

SPLADE learns how to predict irrelevant and missing terms in queries and documents as well as term importance. It outperforms previous sparse approaches and dense baselines, and is able to compete with state-of-the-art dense models. The explicit sparsity regularization also allows a trade-off between effectiveness and efficiency in an end-to-end manner. Finally, we are currently investigating various SPLADE extensions, analysing the words chosen for document expansion and assessing the model performance when it’s transferred to other datasets, such as the BEIR benchmark ([9](https://arxiv.org/abs/2104.08663)).

**This work was done in collaboration with Benjamin Piwowarski, [LIP6](https://www.lip6.fr/?LANG=en), France.**

### References

* [SPLADE: Sparse Lexical and Expansion Model for First Stage Ranking.](https://europe.naverlabs.com/research/publications/splade-sparse-lexical-and-expansion-model-for-first-stage-ranking/) Thibault Formal, Benjamin Piwowarski, Stephane Clinchant. 44th International ACM SIGIR Conference on Research and Development in Information Retrieval (SIGIR), virtual event, July 11-15, 2021.

1: [BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding](https://aclanthology.org/N19-1423.pdf). Jacob Devlin, Ming-Wei Chang, Kenton Lee, Kristina Toutanova. Proceedings of the 2019 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies (NAACL-HLT), Minneapolis, Minnesota, USA, June 2-7, 2019, Vol. 1, pp. 4171–4186.

2: [Billion-Scale Similarity Search with GPUs](https://ieeexplore.ieee.org/document/8733051). Jeff Johnson, Matthijs Douze, Hervé Jégou. IEEE Transactions on Big Data, Vol. 7, No. 3, pp. 535-547, July 1 2021.

3: [Document Expansion by Query Prediction](https://arxiv.org/abs/1904.08375). Rodrigo Nogueira, Wei Yang, Jimmy Lin, Kyunghyun Cho. arXiv 1904.08375 ,2019.

4:[From doc2query to docTTTTTquery](https://cs.uwaterloo.ca/~jimmylin/publications/Nogueira_Lin_2019_docTTTTTquery-v2.pdf). Rodrigo Nogueira, Jimmy Lin. 2019.

5: [Context-Aware Sentence/Passage Term Importance Estimation For First Stage Retrieval](https://arxiv.org/abs/1910.10687). Zhuyun Dai, Jamie Callan. arXiv 1910.10687, 2019.

6: [SparTerm: Learning Term-Based Sparse Representation for Fast Text Retrieval](https://arxiv.org/abs/2010.00768). Yang Bai, Xiaoguang Li, Gang Wang, Chaoliang Zhang, Lifeng Shang, Jun Xu, Zhaowei Wang et al. arXiv 2010.00768, 2020.

7: [Expansion via Prediction of Importance with Contextualization](https://arxiv.org/abs/2004.14245). Sean MacAvaney, Franco Maria Nardini, Raffaele Perego, Nicola Tonellotto, Nazli Goharian, Ophir Frieder. arXiv 2004.14245, 2020.

8: [Minimizing FLOPs to Learn Efficient Sparse Representations.](https://arxiv.org/abs/2004.05665), Biswajit Paria, Chih-Kuan Yeh, Ian E.H. Yen, Ning Xu, Pradeep Ravikumar, Barnabás Póczos. arXiv 2004.05665, 2020.

9: [BEIR: A Heterogenous Benchmark for Zero-Shot Evaluation of Information Retrieval Models](https://arxiv.org/abs/2104.08663). Nandan Thakur, Nils Reimers, Andreas Rücklé, Abhishek Srivastava, Iryna Gurevych. arXiv 2104.08663, 2021.
