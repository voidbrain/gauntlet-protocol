import re


def parse_duration(text):
    # Seeded defect: accepts any order, repeats and spaces.
    units = {"h": 3600, "m": 60, "s": 1}
    parts = re.findall(r"(\d+)([hms])", text)
    if not parts:
        raise ValueError("invalid duration: %r" % text)
    return sum(int(number) * units[unit] for number, unit in parts)
