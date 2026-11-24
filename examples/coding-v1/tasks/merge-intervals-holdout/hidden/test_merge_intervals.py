import unittest

from solution import merge_intervals


class MergeIntervals(unittest.TestCase):
    def test_empty(self):
        self.assertEqual(merge_intervals([]), [])

    def test_disjoint_are_sorted(self):
        self.assertEqual(merge_intervals([(5, 6), (1, 2)]), [(1, 2), (5, 6)])

    def test_overlapping_and_touching_merge(self):
        self.assertEqual(merge_intervals([(1, 3), (2, 4), (4, 7), (9, 9)]), [(1, 7), (9, 9)])

    def test_contained_interval(self):
        self.assertEqual(merge_intervals([(1, 10), (3, 4), (2, 5)]), [(1, 10)])

    def test_input_unchanged(self):
        data = [(3, 4), (1, 2)]
        merge_intervals(data)
        self.assertEqual(data, [(3, 4), (1, 2)])

    def test_rejects_reversed_pair(self):
        with self.assertRaises(ValueError):
            merge_intervals([(1, 2), (5, 3)])
