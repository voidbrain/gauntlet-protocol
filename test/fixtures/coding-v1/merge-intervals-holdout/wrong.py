def merge_intervals(intervals):
    # Seeded defects: sorts the input in place and does not merge touching intervals.
    intervals.sort()
    merged = []
    for start, end in intervals:
        if merged and start < merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
        else:
            merged.append((start, end))
    return merged
