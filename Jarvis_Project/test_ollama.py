import requests
try:
    response = requests.post("http://127.0.0.1:11434/api/generate", json={"model": "llama3", "prompt": "hi"})
    print("Success!")
except Exception as e:
    print(e)