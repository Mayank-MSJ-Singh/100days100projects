import unittest
from Vector import vectoreSearch

class TestVectorSearch(unittest.TestCase):
    def setUp(self):
        self.vs = vectoreSearch()
        self.documents = {
            0: "At Scale You Will Hit Every Performance Issue I used to think I knew a bit ...",
            3: "Why You Shouldnt roll your own CAPTCHA At a TechEd ..."
        }
        self.index = {i: self.vs.todict(doc.lower()) for i, doc in self.documents.items()}

    def test_cosine_similarity_basic(self):
        dict1 = self.vs.todict("apple banana apple")
        dict2 = self.vs.todict("banana apple")
        sim = self.vs.cosine_similarity(dict1, dict2)
        self.assertGreater(sim, 0)
        self.assertLessEqual(sim, 1)

    def test_search_workflow(self):
        searchterm = "captcha"
        query_dict = self.vs.todict(searchterm.lower())
        matches = []
        for i in self.index:
            rel = self.vs.cosine_similarity(query_dict, self.index[i])
            if rel != 0:
                matches.append((rel, self.documents[i][:100]))
        matches.sort(reverse=True)
        self.assertGreater(len(matches), 0)
        self.assertIn("captcha", matches[0][1].lower())

if __name__ == "__main__":
    unittest.main()
