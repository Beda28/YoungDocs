import cv2

def find(edges):
    lines, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)

    for line in sorted(lines, key=cv2.contourArea, reverse=True):
        if cv2.contourArea(line) < edges.size * 0.05: break

        length = cv2.arcLength(line, True)
        points = cv2.approxPolyDP(line, 0.02 * length, True)

        if len(points) == 4 and cv2.isContourConvex(points):
            return points

    return None
def draw(img, points):
    result = img.copy()

    if points is not None: cv2.drawContours(result, [points], -1, (0, 255, 0), 3)

    return result
