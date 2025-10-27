Title: SPLADE for Sparse Vector Search Explained | Pinecone

URL Source: https://www.pinecone.io/learn/splade/

Markdown Content:
Google, Netflix, Amazon, and many more big tech companies all have one thing in common. They power their search and recommendation systems with “vector search”.

Before modern vector search, we had the _“traditional”_ bag of words (BOW) methods. That is, we take a set of _" documents"_ to be retrieved (like web pages on Google). Each document is transformed into a set (bag) of words, and use this to populate a sparse _“frequency vector”_. Popular algorithms for this include TF-IDF and BM25.

These sparse vectors are hugely popular in information retrieval thanks to their efficiency, interpretability, and exact term matching. Yet, they’re _far from perfect_.

Our nature as human beings does not align with sparse vector search. When searching for information, we rarely know the exact terms that will be contained in the documents we’re looking for.

Dense embedding models offer some help in this direction. By using dense models, we can search based on _“semantic meaning”_ rather than term matching. However, these models could be better.

We need vast amounts of data to fine-tune _dense embedding models_; without this, they lack the performance of sparse methods. This is problematic for niche domains where data is hard to find and domain-specific terminology is important.

In the past, there have been a range of _bandaid_ solutions for dealing with this; ranging from complex and (still not perfect) two-stage retrieval systems, to query and document expansion or rewrite methods (as we will explore later). However, none of these came close to being truly robust solutions.

Fortunately, plenty of progress has been made in making the most of both worlds. A merger of sparse and dense retrieval is now possible through [hybrid search](https://docs.pinecone.io/docs/hybrid-search), and _learnable_ sparse embeddings help minimize the traditional drawbacks of sparse retrieval.

This article will cover the latest in learnable sparse embeddings with SPLADE — the **Sp**arse **L**exical **a**n**d****E**xpansion model [1].

* * *

Sparse and Dense
----------------

In information retrieval, vector embeddings represent documents and queries in a numerical vector format. This format allows us to search a vector database and identify similar vectors.

Sparse and dense vectors are two different forms of this representation, each with pros and cons.

![Image 1: Sparse vectors consist of many zero values with very few non-zero values.](https://www.pinecone.io/_next/image/?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2Fvr8gru94%2Fproduction%2F4d26bf690c3351a6592a4e712adc5cb2fb01fab9-1962x130.png&w=3840&q=75)

Sparse vectors consist of many zero values with very few non-zero values.

Sparse vectors like TF-IDF or BM25 have high dimensionality and contain very few non-zero values (hence, they are called _“sparse”_). There are decades of research behind sparse vectors. Resulting in compact data structures and many efficient retireval algorithms designed specifically for these vectors.

Dense vectors are lower-dimensional but information-rich, with non-zero values in most-or-all dimensions. These are typically built using neural network models like transformers and, through this, can represent more abstract information like the _semantic meaning_ behind some text.

Generally speaking, the pros and cons of both methods can be outlined as follows:

**Sparse**

| Pros | Cons |
| --- | --- |
| + Typically faster retrieval | * Performance cannot be improved significantly over baseline |
| + Good baseline performance | * Performance cannot be improved significantly over baseline |
| + Don’t need model fine-tuning | * Suffers from vocabulary mismatch problem |
| + Exact matching of terms |  |

**Dense**

| Pros | Cons |
| --- | --- |
| + Can outperform sparse with fine-tuning | * Requires training data, difficult to do in low-resource scenarios |
| + Search with human-like abstract concepts | * Does not generalize well, particularly for niche terminology |
| + Multi-modality (text, images, audio, etc.) and cross-modal search (e.g., text-to-image) | * Requires more compute and memory than sparse |
|  | * No exact match |
|  | * Not easily interpretable |

Ideally, we want the merge the best of both, but that’s hard to do.

### Two-Stage Retrieval

A typical approach to handling this is implementing a two-stage retrieval and ranking system. In this scenario, we use two distinct stages to retrieve and rank relevant documents for a given query.

In the first stage, the system uses a sparse retrieval method to retrieve a large set of candidate documents. These are then passed to the second stage, where we use a dense model to rerank the results based on their relevance to the query.

![Image 2: Two-stage retrieval system with a sparse retriever and dense reranker.](https://www.pinecone.io/_next/image/?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2Fvr8gru94%2Fproduction%2Fa9f87d9726b4c59a9741ef599cc6916ab96d52e0-2000x1297.png&w=3840&q=75)

Two-stage retrieval system with a sparse retriever and dense reranker.

There are benefits to this, (1) we apply the sparse model to the full set of documents to retrieve, which is more efficient. Then (2) we rerank the now smaller set of documents with the slower dense model, which _can_ be more accurate. From this, we can return much more relevant results to users. Another benefit is that this reranking stage is detached from the retrieval system, this can be useful when the retrieval system is multi-purpose.

However, it isn’t perfect. Two stages of retrieval and reranking can be slower than a single-stage system using [approximate search algorithms](https://www.pinecone.io/learn/series/faiss/vector-indexes/). Having two stages is more complex and therefore brings more engineering challenges. Finally, the performance relies on the first-stage retriever returning relevant results; if nothing useful is returned, the reranking cannot help.

### Improving Single-Stage Systems

Because of the two-stage retrieval drawbacks, much work has been put into improving _single-stage_ retrieval systems.

![Image 3: A single stage retrieval system. Note that the retriever may be sparse, dense, or even both.](https://www.pinecone.io/_next/image/?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2Fvr8gru94%2Fproduction%2Faf93109848794c1de7fcd128fef97afff2062e56-2054x650.png&w=3840&q=75)

A single stage retrieval system. Note that the retriever may be sparse, dense, or even both.

A part of that is the research into more robust and learnable sparse embedding models — and one of the most performant models in this space is SPLADE.

The idea behind the **Sp**arse **L**exical **a**n**d****E**xpansion models is that a pretrained language model like BERT can identify connections between words/sub-words (called _word-pieces_ or “terms” in this article) and use that knowledge to enhance our sparse vector embedding.

This works in two ways, it allows us to weigh the relevance of different terms (something like `the` will carry less relevance than a less common word like `orangutan`). And it enables _term expansion_: the inclusion of alternative but relevant terms beyond those found in the original sequence.

![Image 4: Term expansion allows us to identify relevant but different terms and use them in the sparse vector retrieval step.](https://www.pinecone.io/_next/image/?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2Fvr8gru94%2Fproduction%2F17f0aac1f34b4475121744b672156a611dd8aed6-1029x331.png&w=3840&q=75)

Term expansion allows us to identify relevant but different terms and use them in the sparse vector retrieval step.

The most significant advantage of SPLADE is not necessarily that it can _do_ term expansion but instead that it can _learn_ term expansions. Traditional methods required rule-based term expansion which is time-consuming _and_ fundamentally limited. Whereas SPLADE can use the best language models to learn term expansions and even tweak them based on the sentence context.

![Image 5: Despite having a query and document with many relevant terms, because they are not “exact matches” they are not identified.](https://www.pinecone.io/_next/image/?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2Fvr8gru94%2Fproduction%2Fe97e3b14732629cbc84fcaf6fc4a540d7427f355-1993x493.png&w=3840&q=75)

Despite having a query and document with many relevant terms, because they are not “exact matches” they are not identified.

Term expansion is crucial in minimizing the **vocabulary mismatch problem** — the typical lack of term overlap between queries and relevant documents.

![Image 6: With term expansion on our query we will a much larger overlap because we’re now able to identify similar words.](https://www.pinecone.io/_next/image/?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2Fvr8gru94%2Fproduction%2F2c7a9398a4c20650cc6503e6c98645fccca622b7-2185x743.png&w=3840&q=75)

With term expansion on our query we will a much larger overlap because we’re now able to identify similar words.

It’s expected that relevant documents can contain little-to-no term overlap because of the complexity of language and the multitude of ways we can describe something.

SPLADE Embeddings
-----------------

How SPLADE builds its sparse embeddings is simple to understand. We start with a transformer model like BERT using a **M**asked-**L**anguage **M**odeling (MLM) head.

MLM is the typical pretraining method utilized by many transformers. We can start with an off-the-shelf pretrained BERT model.

### BERT

As mentioned, we will use BERT with an MLM head. If you’re familiar with BERT and MLM, then great — if not, let’s break it down.

BERT is a popular transformer model. Like all transformers, its core functionality is to create _information-rich_ token embeddings. What exactly does that mean?

We start with some text like `"Orangutans are native to the rainforests of Indonesia and Malaysia"`. We would begin by _tokenizing_ the text into BERT-specific sub-word tokens:

In[2]:

```
text = (
    "Orangutans are native to the rainforests of "
    "Indonesia and Malaysia"
)

# create the tokens that will be input into the model
tokens = tokenizer(text, return_tensors="pt")
tokens
```

Out[2]:

```
{'input_ids': tensor([[  101,  2030,  5654, 13210,  3619,  2024,  3128,  2000,  1996, 18951,
          2015,  1997,  6239,  1998,  6027,   102]]), 'token_type_ids': tensor([[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]), 'attention_mask': tensor([[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]])}
```

In[3]:

```
# we transform the input_ids to human-readable tokens
tokenizer.convert_ids_to_tokens(tokens["input_ids"][0])
```

Out[3]:

```
['[CLS]',
 'or',
 '##ang',
 '##uta',
 '##ns',
 'are',
 'native',
 'to',
 'the',
 'rainforest',
 '##s',
 'of',
 'indonesia',
 'and',
 'malaysia',
 '[SEP]']
```

![Image 7: Token IDs are mapped to learned token embeddings within the embedding matrix.](https://www.pinecone.io/_next/image/?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2Fvr8gru94%2Fproduction%2Fd773f2c0a10dc37381b4688626e4fdb9da5fc5a4-2310x1457.png&w=3840&q=75)

Token IDs are mapped to learned token embeddings within the embedding matrix.

These tokens are matched up to an _“embedding matrix”_ that acts as the first layer in the BERT model. In this embedding matrix, we find _learned_ “vector embeddings” that act as a _“numerical representation”_ of these word/sub-word tokens.

![Image 8: The vectors of the embedding matrix each represent a token within a meaningful vector space.](https://www.pinecone.io/_next/image/?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2Fvr8gru94%2Fproduction%2Fe8fe02e5887ff8dda56dff29c18940b0125ebc6b-2318x1466.png&w=3840&q=75)

The vectors of the embedding matrix each represent a token within a meaningful vector space.

From here, the token representations of our original text go through several _“encoder blocks”_. These blocks encode more and more _contextual_ information into each vector embedding based on the surrounding context from the rest of the text.

After this, we arrive at our transformer’s _“output”_, the _information-rich_ vector embeddings. Each embedding represents the earlier token but with added information gathered from the other token vector embeddings also extracted from the original sentence.

![Image 9: Processing the initial token embedding through several attention encoder blocks allows more contextual information to be encoded, producing information-rich embeddings.](https://www.pinecone.io/_next/image/?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2Fvr8gru94%2Fproduction%2F00a694f2f4e9f7ad6006f538df551c5ec3c23347-2458x1363.png&w=3840&q=75)

Processing the initial token embedding through several attention encoder blocks allows more contextual information to be encoded, producing information-rich embeddings.

This process is the _core_ of BERT and every other transformer model. However, the power of transformers is the considerable number of things for which these information-rich vectors can be used. Typically, we add a task-specific _“head”_ to a transformer to transform these vectors into something else, like predictions or _sparse vectors_.

### Masked Language Modeling Head

The MLM head is one of many heads commonly used with BERT models. Unlike most heads, an MLM head is used during the initial pretraining of BERT.

This works by taking an input sentence; again, let’s use `"Orangutans are native to the rainforests of Indonesia and Malaysia"`. We tokenize the text and then replace random tokens with a `[MASK]` token.

![Image 10: Any word or sub-word token can be masked using the [MASK] token.](https://www.pinecone.io/_next/image/?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2Fvr8gru94%2Fproduction%2Fc42f70bc4a63b5ff24ac0eb763af20bdfe6d45fc-1770x363.png&w=3840&q=75)

Any word or sub-word token can be masked using the [MASK] token.

This masked token sequence is passed as input to BERT. At the other end, we give the original sentence to the MLM head. BERT and the MLM head are then optimized for predicting the original word/sub-word token that had been replaced by a `[MASK]` token.

![Image 11: The MLM head produces a probability distribution from each output logit. The probabilities act as predictions of [MASK] representing each token from the vocab.](https://www.pinecone.io/_next/image/?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2Fvr8gru94%2Fproduction%2Fd64d431fb1b50ae9aa94b5cd85e1cdffe5eb7ca1-2318x1516.png&w=3840&q=75)

The MLM head produces a probability distribution from each output logit. The probabilities act as predictions of [MASK] representing each token from the vocab.

For this to work, the MLM head contains _30522_ output values for each token position. These _30522_ values represent the BERT vocabulary and act as a _probability distribution_ over the vocab. The highest activation represents the token prediction for that particular token position.

### MLM and Sparse Vectors

These 30522 probability distributions w i j w_{ij} act as an indicator of which words/tokens j j from the vocab are most important. The MLM head outputs these distributions for every token i i input to the model.

![Image 12: The MLM head gives us a probability distribution for each token, whether or not they have been masked. These distributions are aggregated to give the importance estimation.](https://www.pinecone.io/_next/image/?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2Fvr8gru94%2Fproduction%2F08212e88d27be2dfb661ccd7330c1236f0b5a47a-2435x1457.png&w=3840&q=75)

The MLM head gives us a probability distribution for each token, whether or not they have been masked. These distributions are aggregated to give the importance estimation.

SPLADE takes all these distributions and aggregates them into a single distribution called the _importance estimation_ w j w_j. This importance estimation is the _sparse vector_ produced by SPLADE. We can combine all these probability distributions into a _single_ distribution that tells us the _relevance_ of every token in the vocab to our input sentence.

w j=∑i∈t l o g(1+R e L U(w i j))w_j = \sum_{i \in t}log(1 + ReLU(w_{ij}))

Where:

i∈t i \in t : Every token i i in the input set of tokens t t.

w i j w_{ij}: Every predicted weight for all tokens j j in the vocab V V, for each token i i.

This allows us to identify relevant tokens that do not exist within the input sentence. For example, if we mask the word `rainforest`, we may return high predictions

w j w_j

 for the words `jungle`, `land`, and `forest`. These words and their associated probabilities would then be represented in the SPLADE-built sparse vector.
This **_learned_**_query/document expansion_ to include other relevant terms is a crucial advantage of SPLADE over traditional sparse methods. Helping us minimize the vocabulary mismatch problem based on learned relationships and term context.

![Image 13: Term expansion in the query can lead to much greater overlap between queries and relevant documents, helping us minimize the vocabulary mismatch problem.](https://www.pinecone.io/_next/image/?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2Fvr8gru94%2Fproduction%2F81ba987ca3713008eb0b9ecaf1a4680d03fcff5f-2185x743.png&w=3840&q=75)

Term expansion in the query can lead to much greater overlap between queries and relevant documents, helping us minimize the vocabulary mismatch problem.

As many transformer models are pretrained with MLM, there are a large number of models that have trained MLM head weights that can be used for later SPLADE fine-tuning.

### Where SPLADE Works Less Well

SPLADE is an excellent approach to minimizing the vocabulary mismatch problem commonly found in sparse vector methods. However, there are some drawbacks that we need to consider.

Compared to other sparse methods, retrieval with SPLADE is _slow_. There are three primary reasons for this:

1.   The number of non-zero values in SPLADE query and document vectors is typically greater than in traditional sparse vectors, and sparse retrieval systems are not optimized for this.
2.   The distribution of non-zero values deviates from the traditional distribution expected by the sparse retrieval systems, again causing slowdowns.
3.   SPLADE vectors are not natively supported by _most_ sparse retrieval systems. Meaning we must perform multiple pre and post-processing steps, weight discretization, etc.

Fortunately, there are solutions to all of these problems. For (1), the authors of SPLADE addressed this in a later version of the model that minimizes the number of query vector non-zero values [2].

Reducing the number of query vector non-zero values was made possible through two steps. First, by first improving the performance of the SPLADE document encodings via a max pooling modification to the original pooling strategy:

w j=m a x i∈t l o g(1+R e L U(w i j))w_j = max_{i \in t}log(1 + ReLU(w_{ij}))

Second, by limiting term expansion to the document encodings _only_. Thanks to the improved document encoding performance, dropping query expansions still leaves us with better performance than the original SPLADE model.

Both (2) and (3) are solved using the Pinecone vector database. (2) is solved by Pinecone’s retrieval engine being designed from the ground up to be agnostic to data distribution. Pinecone allows real-valued sparse vectors — meaning SPLADE vectors are supported by default.

SPLADE Implementation
---------------------

We have two options for implementing SPLADE; directly with Hugging Face transformers and PyTorch, or with more abstraction using the official SPLADE library. We will demonstrate both, starting with the Hugging Face and PyTorch implementation to understand how it works.

### Hugging Face and PyTorch

To begin, we install all prerequisites:

`!pip install -U transformers torch`

Then we initialize the BERT tokenizer and BERT model with masked-language modeling (MLM) head. We load the fine-tuned SPLADE model weights from `naver/splade-cocondenser-ensembledistil`.

```
from transformers import AutoModelForMaskedLM, AutoTokenizer

model_id = 'naver/splade-cocondenser-ensembledistil'

tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForMaskedLM.from_pretrained(model_id)
```

From here, we can create an input document `text`, tokenize it, and process it through the `model` to produce the MLM head output logits.

In[24]:

```
tokens = tokenizer(text, return_tensors='pt')
output = model(**tokens)
output
```

Out[24]:

```
MaskedLMOutput(loss=None, logits=tensor([[[ -6.9833,  -8.2131,  -8.1693,  ...,  -8.1552,  -7.8168,  -5.8152],
         [-13.6888, -11.7828, -12.5595,  ..., -12.4415, -11.5789, -12.0632],
         [ -8.7075,  -8.7019,  -9.0092,  ...,  -9.1933,  -8.4834,  -6.8165],
         ...,
         [ -5.1051,  -7.7245,  -7.0402,  ...,  -7.5713,  -6.9855,  -5.0462],
         [-23.5020, -18.8779, -17.7931,  ..., -18.2811, -17.2806, -19.4826],
         [-21.6329, -17.7142, -16.6525,  ..., -17.1870, -16.1865, -17.9581]]],
       grad_fn=<ViewBackward0>), hidden_states=None, attentions=None)
```

In[25]:

`output.logits.shape`

Out[25]:

`torch.Size([1, 91, 30522])`

This leaves us with _91_ probability distributions, each of dimensionality _30522_. To transform this into the SPLADE sparse vector, we do the following:

In[26]:

```
import torch

vec = torch.max(
    torch.log(
        1 + torch.relu(output.logits)
    ) * tokens.attention_mask.unsqueeze(-1),
dim=1)[0].squeeze()

vec.shape
```

Out[26]:

`torch.Size([30522])`

In[27]:

`vec`

Out[27]:

`tensor([0., 0., 0.,  ..., 0., 0., 0.], grad_fn=<SqueezeBackward0>)`

Because our vector is sparse, we can transform it into a much more compact dictionary format, keeping only the non-zero positions and weights.

In[29]:

```
# extract non-zero positions
cols = vec.nonzero().squeeze().cpu().tolist()
print(len(cols))

# extract the non-zero values
weights = vec[cols].cpu().tolist()
# use to create a dictionary of token ID to weight
sparse_dict = dict(zip(cols, weights))
sparse_dict
```

Out[29]:

```
174
```

Out[29]:

```
{1000: 0.6246446967124939,
 1039: 0.45678916573524475,
 1052: 0.3088974058628082,
 1997: 0.15812619030475616,
 1999: 0.07194626331329346,
 2003: 0.6496524810791016,
 2024: 0.9411943554878235,
 ...,
 29215: 0.3594200909137726,
 29278: 2.276832342147827}
```

This is the final format of our sparse vector, but it’s not very interpretable. What we can do is translate the token ID keys to human-readable plaintext tokens. We do that like so:

In[28]:

```
# extract the ID position to text token mappings
idx2token = {
    idx: token for token, idx in tokenizer.get_vocab().items()
}
```

In[30]:

```
# map token IDs to human-readable tokens
sparse_dict_tokens = {
    idx2token[idx]: round(weight, 2) for idx, weight in zip(cols, weights)
}
# sort so we can see most relevant tokens first
sparse_dict_tokens = {
    k: v for k, v in sorted(
        sparse_dict_tokens.items(),
        key=lambda item: item[1],
        reverse=True
    )
}
sparse_dict_tokens
```

Out[30]:

```
{'pc': 3.02,
 'lace': 2.95,
 'programmed': 2.36,
 '##for': 2.28,
 'madagascar': 2.26,
 'death': 1.96,
 '##d': 1.95,
 'lattice': 1.81,
 ...,
 'carter': 0.0,
 'reg': 0.0}
```

Now we can see the most highly scored tokens from the sparse vector, including important field-specific terms like `programmed`, `cell`, `lattice`, `regulated`, and so on.

### Naver Labs SPLADE

Another higher-level alternative is using the SPLADE library itself. We install it with `pip install git+https://github.com/naver/splade.git` and initialize the same model and vector building steps as above, using:

```
from splade.models.transformer_rep import Splade

sparse_model_id = 'naver/splade-cocondenser-ensembledistil'

sparse_model = Splade(sparse_model_id, agg='max')
sparse_model.eval()
```

We must still tokenize the input using a Hugging Face tokenizer to give us `tokens`, then we create the sparse vectors with:

In[13]:

```
with torch.no_grad():
    sparse_emb = naver_model(
        d_kwargs=tokens
    )['d_rep'].squeeze()
sparse_emb.shape
```

Out[13]:

`torch.Size([30522])`

These embeddings can be processed into a smaller sparse vector dictionary using the same code above. The resultant data is the same as we built with the **Hugging Face and PyTorch** method.

### Comparing Vectors

Let’s look at how to actually compare our sparse vectors. We’ll define three short texts.

```
texts = [
   "Programmed cell death (PCD) is the regulated death of cells within an organism",
   "How is the scheduled death of cells within a living thing regulated?",
   "Photosynthesis is the process of storing light energy as chemical energy in cells"
]
```

As before, we encode everything with the `tokenizer`, build output logits with the `model`, and transform the token-level vectors into single sparse vectors.

In[15]:

```
tokens = tokenizer(
    texts, return_tensors='pt',
    padding=True, truncation=True
)
output = model(**tokens)
# aggregate the token-level vecs and transform to sparse
vecs = torch.max(
    torch.log(1 + torch.relu(output.logits)) * tokens.attention_mask.unsqueeze(-1), dim=1
)[0].squeeze().detach().cpu().numpy()
vecs.shape
```

Out[15]:

`(3, 30522)`

We now have three 30522-dimensional sparse vectors. To compare them, we can use cosine or dot-product similarity. Using cosine similarity, we do the following:

In[16]:

```
import numpy as np

sim = np.zeros((vecs.shape[0], vecs.shape[0]))

for i, vec in enumerate(vecs):
    sim[i,:] = np.dot(vec, vecs.T) / (
        np.linalg.norm(vec) * np.linalg.norm(vecs, axis=1)
    )
```

In[17]:

`sim`

Out[17]:

```
array([[1.        , 0.54609376, 0.20535842],
       [0.54609376, 0.99999988, 0.20411882],
       [0.2053584 , 0.20411879, 1.        ]])
```

Leaving us with:

![Image 14: Similarity heatmap using calculated values from sim above. Sentences 1 and 2 share the highest similarity (with the exception of the diagonals which are just a comparison of each sentence to itself).](https://www.pinecone.io/_next/image/?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2Fvr8gru94%2Fproduction%2F47ce7c0ddc41bf1cab460b69364c7299e747e9f6-982x976.png&w=2048&q=75)

Similarity heatmap using calculated values from sim above. Sentences 1 and 2 share the highest similarity (with the exception of the diagonals which are just a comparison of each sentence to itself).

The two similar sentences naturally score higher than the third irrelevant sentence.

* * *

That’s it for this introduction to learned sparse embeddings with SPLADE. Through SPLADE, we can represent text with efficient sparse vector embeddings. Helping us deal with the vocabulary mismatch problem while enabling exact matching.

We’ve also seen where SPLADE falls short when used in traditional retrieval systems. Fortunately, we covered how improvements through SPLADEv2 and distribution agnostic retrieval systems like Pinecone can help us sidestep those shortfalls.

There is still plenty more to be done. More research and recent efforts demonstrate the benefit of mixing both [dense and sparse representations using](https://docs.pinecone.io/docs/hybrid-search)[_hybrid search indexes_](https://docs.pinecone.io/docs/hybrid-search). In this, and many other advances, we can see vector search becoming ever more accurate and accessible.

* * *

References
----------

[1] T. Formal, B. Piwowarski, S. Clinchant, [SPLADE: Sparse Lexical and Expansion Model for First Stage Ranking](https://arxiv.org/abs/2107.05720) (2021), SIGIR 21

[2] T. Formal, C. Lassance, B. Piwowarski, S. Clinchant, [SPLADE v2: Sparse Lexical and Expansion Model for Information Retrieval](https://export.arxiv.org/abs/2109.10086) (2021)
