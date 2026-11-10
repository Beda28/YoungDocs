from datetime import date

import re

def rows(lines):
    groups = []
    for line in sorted(lines, key=lambda item: sum(point[1] for point in item['box']) / 4):
        if line['confidence'] < .8: continue
        box = line['box']
        y = sum(point[1] for point in box) / 4
        height = max(point[1] for point in box) - min(point[1] for point in box)
        if groups and abs(groups[-1]['y'] - y) <= min(groups[-1]['height'], height) * .5:
            groups[-1]['lines'].append(line)
        else:
            groups.append({'y': y, 'height': height, 'lines': [line]})
    return [' '.join(line['text'] for line in sorted(group['lines'], key=lambda item: min(point[0] for point in item['box']))) for group in groups]

def dates(texts):
    found = []
    for text in texts:
        text = re.sub(r'\s*([-./년월일])\s*', r'\1', text)
        if re.search(r'유효|유통|제조|만료|생년|배송|발행예정|EXPIR|BIRTH', text, re.I): continue
        for match in re.finditer(r'(?<!\d)(20\d{2})(?:[-./]|년)(\d{1,2})(?:[-./]|월)(\d{1,2})(?:일)?(?=\D|$|[0-2]\d:[0-5]\d)', text):
            try: value = date(*map(int, match.groups())).isoformat()
            except ValueError: continue
            rank = int(bool(re.search(r'거래|결제|승인|구매|주문|DATE', text, re.I)))
            found.append((rank, value))
    if not found: return None
    rank = max(item[0] for item in found)
    values = {value for score, value in found if score == rank}
    return values.pop() if len(values) == 1 else None

def amounts(texts):
    if re.search(r'취소|환불|REFUND|VOID', ' '.join(texts), re.I): return None
    found = []
    for index, text in enumerate(texts):
        text = re.sub(r'\s+', '', text).upper()
        if re.search(r'소계|공급가|부가세|할인|거스름|취소|환불|수량|포인트|적립|SUBTOTAL|TAX|CHANGE|REFUND', text): continue
        label = re.search(r'총결제금액|결제금액|승인금액|청구금액|총합계|합계금액|합계|총액|(?<![A-Z])TOTAL(?=KRW|[^A-Z]|$)', text)
        if not label: continue
        value = text[label.end():].lstrip(':：=')
        if not value and index + 1 < len(texts): value = re.sub(r'\s+', '', texts[index + 1]).upper()
        if not re.search(r'[가-힣]|원|₩|KRW', label.group() + value): continue
        if not re.fullmatch(r'(?:₩|KRW)?(?:\d{1,3}(?:,\d{3})+|\d+)(?:원|KRW)?', value): continue
        amount = int(re.sub(r'\D', '', value))
        if not 0 < amount <= 2147483647: continue
        rank = int(bool(re.search(r'결제|승인|청구', label.group())))
        found.append((rank, amount))
    if not found: return None
    rank = max(item[0] for item in found)
    values = {value for score, value in found if score == rank}
    return values.pop() if len(values) == 1 else None

def extract(lines):
    texts = rows(lines)
    return {'date': dates(texts), 'amount': amounts(texts)}
