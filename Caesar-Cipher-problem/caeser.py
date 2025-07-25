def caesar_cipher_encrypt(text, shift):
    result = ""
    for char in text:
        if char.isalpha():
            base = ord('A') if char.isupper() else ord('a')
            shifted = (ord(char) - base + shift) % 26
            result += chr(base + shifted)
        else:
            result += char
    return result

def caesar_cipher_decrypt(text, shift):
    return caesar_cipher_encrypt(text, -shift)


message = input("Enter the message: ")
shift = int(input("Enter the shift value: "))


encrypted = caesar_cipher_encrypt(message, shift)
decrypted = caesar_cipher_decrypt(encrypted, shift)


print("Original Message :", message)
print("Encrypted Message:", encrypted)
print("Decrypted Message:", decrypted)