import json
import pprint

def get_overlap(p1, p2):
    start1, end1 = p1
    start2, end2 = p2
    overlap_start = max(start1, start2)
    overlap_end = min(end1, end2)
    return max(0, overlap_end - overlap_start)

def is_significant_overlap(p1, p2):
    overlap = get_overlap(p1, p2)
    len1 = p1[1] - p1[0]
    len2 = p2[1] - p2[0]
    return overlap >= 0.5 * min(len1, len2)

def combine_elements(elem1, elem2):
    pos = elem1["positions"] if elem1["positions"][0] <= elem2["positions"][0] else elem2["positions"]
    values = elem1.get("values", []) + elem2.get("values", [])
    return {"positions": pos, "values": values}

def merge_element_lists(list1, list2):
    all_elements = sorted(list1 + list2, key=lambda x: x["positions"][0])
    merged = []

    for elem in all_elements:
        merged_with_existing = False
        for i in range(len(merged)):
            if is_significant_overlap(merged[i]["positions"], elem["positions"]):
                merged[i] = combine_elements(merged[i], elem)
                merged_with_existing = True
                break
        if not merged_with_existing:
            merged.append(elem)

    return merged


print("Enter list1 (as JSON):")
list1 = json.loads(input())  

print("Enter list2 (as JSON):")
list2 = json.loads(input())  
result = merge_element_lists(list1, list2)
pprint.pprint(result)