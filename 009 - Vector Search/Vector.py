class vectoreSearch:
    def todict(self, document):
        if not isinstance(document, str):
            raise TypeError("Enter String Stupid!")

        doc_dict = {}
        for word in document.split(" "):
            if word in doc_dict:
                doc_dict[word] += 1
            else:
                doc_dict[word] = 1

        return doc_dict

    def equlidian_dist(self, todict):
        if not isinstance(todict, dict):
            raise TypeError("Enter Dictionary Stupid!")
        dist = 0
        for word in todict:
            dist += todict[word]**2
        return dist**0.5

    def cosine_similarity(self, todict1, todict2):
        if not isinstance(todict1, dict):
            raise TypeError("Enter dict Stupid!")
        if not isinstance(todict2, dict):
            raise TypeError("Enter dict Stupid!")

        dot = 0
        for word in todict1:
            if word in todict2:
                dot += todict1[word] * todict2[word]

        if (self.equlidian_dist(todict1) * self.equlidian_dist(todict2)) != 0:
            return dot / (self.equlidian_dist(todict1) * self.equlidian_dist(todict2))

        else:
            return 0

