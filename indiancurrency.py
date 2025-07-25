def format_indian_currency(number):
    num_str = str(number)

    if '.' in num_str:
        int_part, dec_part = num_str.split('.')
        dec_part = '.' + dec_part  
    else:
        int_part = num_str
        dec_part = ''

    int_rev = int_part[::-1]

    formatted = int_rev[:3] 
    for i in range(3, len(int_rev), 2):
        formatted += ',' + int_rev[i:i+2]

    indian_formatted = formatted[::-1] + dec_part
    return indian_formatted
number = float(input("Enter a number: "))
result = format_indian_currency(number)
print("Formatted (Indian):", result)