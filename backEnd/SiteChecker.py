import requests
import pandas as pd
from sklearn.linear_model import LinearRegression
from datetime import datetime
import json
import sys

# ✅ Verifica se uma URL foi passada como argumento
if len(sys.argv) < 2:
    print(json.dumps({"error": "URL não fornecida"}))
    sys.exit(1)

url_check = sys.argv[1]

# ✅ Configuração da API do VirusTotal
API_KEY = "ce7de855a44cd3422f5dc0a490744cb0a9869b83ba30963ee3e4e62158b5306a"
VIRUSTOTAL_API_URL = "https://www.virustotal.com/api/v3/domains/{}"

# ✅ Domínios para treino
DOMINIOS_TREINO = [
    "rodapremiada.top",
    "donttbeevils.de",
    "yfilesstorage.com",
    "tawuhoju.com",
    "freemoney.xyz",
    "roblox.com",
    "paypal.com",
    "youtube.com",
    "hieronymus-juv.com",
    "yahoo.com",
]

def obter_dados_virustotal(domain):
    try:
        url = VIRUSTOTAL_API_URL.format(domain)
        headers = {"x-apikey": API_KEY}
        response = requests.get(url, headers=headers, timeout=10)

        if response.status_code != 200:
            return None

        data = response.json()
        attributes = data.get("data", {}).get("attributes", {})
        stats = attributes.get("last_analysis_stats", {})

        whois_date = attributes.get("whois_date", 0)
        idade_dias = (
            (datetime.now() - datetime.fromtimestamp(whois_date)).days
            if whois_date != 0
            else 0
        )

        redirecionamentos = len(attributes.get("last_redirects", []))

        return {
            "malicious": stats.get("malicious", 0),
            "suspicious": stats.get("suspicious", 0),
            "harmless": stats.get("harmless", 0),
            "undetected": stats.get("undetected", 0),
            "idade_dias": idade_dias,
            "redirecionamentos": redirecionamentos
        }

    except Exception:
        return None


def calcular_risco(dados):
    risco = (
        dados["malicious"] * 10 +
        dados["suspicious"] * 5 +
        dados["redirecionamentos"] * 0.1 -
        dados["idade_dias"] * 0.01
    )
    return max(min(risco, 100), 0)


# ✅ Treina o modelo
dados_treino = []
for dominio in DOMINIOS_TREINO:
    resultado = obter_dados_virustotal(dominio)
    if resultado:
        resultado["risco"] = calcular_risco(resultado)
        dados_treino.append(resultado)

if not dados_treino:
    print(json.dumps({"error": "Falha ao obter dados para treino"}))
    sys.exit(1)

df = pd.DataFrame(dados_treino)
X = df[["malicious", "suspicious", "harmless", "undetected", "idade_dias", "redirecionamentos"]]
y = df["risco"]

modelo = LinearRegression()
modelo.fit(X, y)

# ✅ Coleta dados da URL enviada
dados_site = obter_dados_virustotal(url_check)

if not dados_site:
    print(json.dumps({"error": "Falha ao obter dados do domínio"}))
    sys.exit(1)

entrada = pd.DataFrame([dados_site])
risco_previsto = modelo.predict(entrada)[0]
risco_previsto = max(min(risco_previsto, 100), 0)

dados_site["risco_previsto"] = risco_previsto

# ✅ Retorna resultado como JSON no stdout
print(json.dumps(dados_site))
