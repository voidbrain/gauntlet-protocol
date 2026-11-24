import unittest

from solution import parse_duration


class ParseDuration(unittest.TestCase):
    def test_single_units(self):
        self.assertEqual(parse_duration("45s"), 45)
        self.assertEqual(parse_duration("2m"), 120)
        self.assertEqual(parse_duration("3h"), 10800)

    def test_combined_units(self):
        self.assertEqual(parse_duration("1h30m"), 5400)
        self.assertEqual(parse_duration("1h2m3s"), 3723)

    def test_skipped_middle_unit(self):
        self.assertEqual(parse_duration("2h5s"), 7205)

    def test_multi_digit_numbers(self):
        self.assertEqual(parse_duration("90m"), 5400)
        self.assertEqual(parse_duration("100s"), 100)

    def test_rejects_malformed_text(self):
        for text in ["", "h", "10", "5x", "1h 30m", "-5s", "1.5h"]:
            with self.assertRaises(ValueError, msg=text):
                parse_duration(text)

    def test_rejects_repeated_or_reordered_units(self):
        for text in ["1m1m", "30m1h", "5s2m"]:
            with self.assertRaises(ValueError, msg=text):
                parse_duration(text)
