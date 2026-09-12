import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

import numpy as np
import onnxruntime as ort
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoTokenizer
from deep_translator import GoogleTranslator
from contextlib import asynccontextmanager
from typing import List

DISEASE_CLASSES = [
    "Mụn trứng cá (Acne)",
    "Dị ứng (Allergy)",
    "Viêm khớp (Arthritis)",
    "Hen phế quản (Bronchial Asthma)",
    "Thoái hóa đốt sống cổ (Cervical spondylosis)",
    "Thủy đậu (Chicken pox)",
    "Cảm lạnh chung (Common Cold)",
    "Sốt xuất huyết (Dengue)",
    "Tiểu đường (Diabetes)",
    "Bệnh trĩ (Dimorphic Hemorrhoids)",
    "Phản ứng thuốc (Drug reaction)",
    "Nhiễm trùng nấm (Fungal infection)",
    "Trào ngược dạ dày thực quản (GERD)",
    "Cao huyết áp (Hypertension)",
    "Chốc lở (Impetigo)",
    "Vàng da (Jaundice)",
    "Sốt rét (Malaria)",
    "Đau nửa đầu (Migraine)",
    "Viêm loét dạ dày (Peptic ulcer disease)",
    "Viêm phổi (Pneumonia)",
    "Vẩy nến (Psoriasis)",
    "Thương hàn (Typhoid)",
    "Nhiễm trùng đường tiết niệu (Urinary tract infection)",
    "Viêm tĩnh mạch (Varicose Veins)"
]

tokenizer = None
ort_session = None
translator = GoogleTranslator(source='vi', target='en')

@asynccontextmanager
async def lifespan(app: FastAPI):
    global tokenizer, ort_session
    print("[INFO] Đang khởi tạo và nạp mô hình AI (ONNX)...")

    try:
        tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
        print("[SUCCESS] Đã nạp thành công Tokenizer: bert-base-uncased")
    except Exception as e:
        raise RuntimeError(f"Lỗi khi tải Tokenizer: {str(e)}")

    onnx_model_path = os.path.join(os.path.dirname(__file__), "symptom2disease_model.onnx")
    if not os.path.exists(onnx_model_path):
         print(f"[ERROR] Không tìm thấy file {onnx_model_path}.")
    else:
        try:
            ort_session = ort.InferenceSession(onnx_model_path)
            print(f"[SUCCESS] Đã nạp thành công mô hình ONNX từ {onnx_model_path}!")
        except Exception as e:
            print(f"[ERROR] Không thể nạp file ONNX: {str(e)}")
            ort_session = None

    print("[SUCCESS] Khởi chạy hệ thống AI hoàn tất.")
    yield
    print("[INFO] Đang đóng dịch vụ AI...")

app = FastAPI(lifespan=lifespan, title="MediConnect AI Inference Engine")

class SymptomRequest(BaseModel):
    text: str

class PredictionResponse(BaseModel):
    disease: str
    confidence: float
    translated_text_used: str

class ChatMessage(BaseModel):
    role: str
    text: str

class ChatRequest(BaseModel):
    api_key: str | None = None
    message: str
    history: List[ChatMessage]

import re

def is_meaningless_text(text: str) -> bool:
    if not text or not isinstance(text, str):
        return True
    trimmed = text.strip()
    if len(trimmed) < 2:
        return True

    if re.fullmatch(r'[\d\W_]+', trimmed):
        return True

    if re.fullmatch(r'(.)\1{2,}', trimmed, re.IGNORECASE):
        return True

    has_vowels = bool(re.search(r'[aeiouyàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹ]', trimmed, re.IGNORECASE))
    if not has_vowels and len(trimmed) >= 3:
        return True

    gibberish_patterns = [
        r'^[asdfghjkl]+$',
        r'^[qwertyuiop]+$',
        r'^[zxcvbnm]+$',
        r'^(abc|xyz|test|alo|asdf|123|ha|hi|he|ho)$'
    ]
    if any(re.fullmatch(pat, trimmed, re.IGNORECASE) for pat in gibberish_patterns):
        return True
    return False

def run_mediconnect_simulation(message: str, history: List[ChatMessage]):

    if is_meaningless_text(message):
        return {
            "reply": (
                "Tôi chưa hiểu mô tả triệu chứng của bạn. "
                "Vui lòng nhập rõ các triệu chứng bạn đang gặp phải (ví dụ: sốt, ho khan, đau đầu, đau tức ngực, mệt mỏi...) để tôi có thể hỗ trợ chẩn đoán cho bạn nhé."
            )
        }

    patient_messages = [msg for msg in history if msg.role == 'patient']
    user_turn = len(patient_messages) + 1

    all_symptoms = " ".join([msg.text for msg in patient_messages]) + " " + message
    all_symptoms_lower = all_symptoms.lower()

    if user_turn == 1:
        return {
            "reply": (
                "Chào bạn, tôi là trợ lý y khoa MediConnect. "
                "Tôi đã ghi nhận triệu chứng ban đầu là: \"" + message + "\". "
                "Bạn có thể cho tôi biết triệu chứng này đã xuất hiện được bao lâu rồi không?"
            )
        }
    elif user_turn == 2:
        return {
            "reply": (
                "Cảm ơn bạn. "
                "Bạn có thể mô tả rõ hơn mức độ nghiêm trọng của cảm giác này không? "
                "(Ví dụ: đau âm ỉ, đau nhói, có ảnh hưởng đến sinh hoạt hàng ngày không?)"
            )
        }
    elif user_turn == 3:
        return {
            "reply": (
                "Tôi đã hiểu. "
                "Bạn có kèm theo các triệu chứng nào khác không, ví dụ như sốt, ho, nhức mỏi cơ thể hoặc phát ban?"
            )
        }
    elif user_turn == 4:
        msg1 = patient_messages[0].text if len(patient_messages) > 0 else message
        msg2 = patient_messages[1].text if len(patient_messages) > 1 else "chưa rõ"
        msg3 = patient_messages[2].text if len(patient_messages) > 2 else "chưa rõ"
        return {
            "reply": (
                "Tóm tắt các triệu chứng bạn đã chia sẻ:\n"
                f"- Triệu chứng chính: {msg1}\n"
                f"- Thời gian kéo dài: {msg2}\n"
                f"- Mức độ/Triệu chứng đi kèm: {msg3}\n\n"
                "Bạn có tiền sử bệnh lý gì đặc biệt hoặc đang sử dụng thuốc nào gần đây không?"
            )
        }

DISEASE_KNOWLEDGE_BASE = {
    "Mụn trứng cá (Acne)": {
        "keywords_vi": ["mụn", "mụn trứng cá", "mụn bọc", "mụn mủ", "mụn đầu đen", "bã nhờn", "nổi mụn ở mặt", "lỗ chân lông to", "mụn viêm"],
        "keywords_en": ["acne", "pimple", "pimples", "blackhead", "whitehead", "pus", "breakout", "oily skin", "facial spots", "blemishes"],
        "base_confidence": 0.94
    },
    "Dị ứng (Allergy)": {
        "keywords_vi": ["dị ứng", "hắt hơi", "sổ mũi", "ngứa mũi", "ngứa mắt", "mẩn ngứa", "mề đay", "phát ban ngứa", "chảy nước mắt", "dị ứng phấn hoa", "dị ứng thức ăn"],
        "keywords_en": ["allergy", "allergic", "sneeze", "sneezing", "runny nose", "itch", "itching", "hives", "watery eyes", "allergic rhinitis"],
        "base_confidence": 0.93
    },
    "Viêm khớp (Arthritis)": {
        "keywords_vi": ["đau khớp", "sưng khớp", "cứng khớp", "viêm khớp", "mỏi khớp", "đau đầu gối", "đau cổ tay", "đau khớp ngón tay", "thoái hóa khớp"],
        "keywords_en": ["arthritis", "joint pain", "joint stiffness", "swollen joints", "knee pain", "bone ache", "rheumatism", "arthralgia"],
        "base_confidence": 0.91
    },
    "Hen phế quản (Bronchial Asthma)": {
        "keywords_vi": ["hen suyễn", "hen phế quản", "thở khò khè", "khó thở", "co thắt ngực", "cơn khó thở về đêm", "hụt hơi", "thở rít"],
        "keywords_en": ["asthma", "wheezing", "shortness of breath", "breathing difficulty", "chest tightness", "bronchospasm", "gasping"],
        "base_confidence": 0.92
    },
    "Thoái hóa đốt sống cổ (Cervical spondylosis)": {
        "keywords_vi": ["thoái hóa đốt sống cổ", "đau cổ", "mỏi cổ", "đau vai gáy", "cứng cổ", "tê tay", "tê dọc cánh tay", "đau đốt sống cổ"],
        "keywords_en": ["cervical spondylosis", "neck pain", "stiff neck", "neck stiffness", "shoulder ache", "numbness in hands", "cervical spine"],
        "base_confidence": 0.90
    },
    "Thủy đậu (Chicken pox)": {
        "keywords_vi": ["thủy đậu", "phỏng rạ", "bóng nước", "mụn nước khắp người", "mụn nước ngứa", "sốt phát ban mụn nước", "nốt đậu"],
        "keywords_en": ["chicken pox", "varicella", "blister", "blisters", "itchy blisters", "vesicles", "fluid filled bumps"],
        "base_confidence": 0.95
    },
    "Cảm lạnh chung (Common Cold)": {
        "keywords_vi": ["cảm lạnh", "cảm cúm", "sốt nhẹ", "rát họng", "đau họng", "nghẹt mũi", "chảy nước mũi", "hắt xì", "ho có đờm nhẹ"],
        "keywords_en": ["common cold", "cold", "sore throat", "mild fever", "cough", "nasal congestion", "runny nose", "sniffles"],
        "base_confidence": 0.89
    },
    "Sốt xuất huyết (Dengue)": {
        "keywords_vi": ["sốt xuất huyết", "sốt cao liên tục", "đau hốc mắt", "chấm đỏ dưới da", "chảy máu cam", "chảy máu chân răng", "đau cơ dữ dội", "sốt phát ban đỏ"],
        "keywords_en": ["dengue", "dengue fever", "high fever", "eye pain", "retro orbital pain", "bleeding rash", "petechiae", "severe muscle pain"],
        "base_confidence": 0.94
    },
    "Tiểu đường (Diabetes)": {
        "keywords_vi": ["tiểu đường", "đái tháo đường", "khát nước liên tục", "tiểu nhiều lần", "tiểu đêm", "sụt cân nhanh", "mờ mắt", "đói liên tục", "vết thương lâu lành"],
        "keywords_en": ["diabetes", "high blood sugar", "excessive thirst", "frequent urination", "polyuria", "weight loss", "blurred vision", "polydipsia"],
        "base_confidence": 0.92
    },
    "Bệnh trĩ (Dimorphic Hemorrhoids)": {
        "keywords_vi": ["trĩ", "bệnh trĩ", "trĩ nội", "trĩ ngoại", "đi ngoài ra máu", "đau rát hậu môn", "sa búi trĩ", "ngứa hậu môn", "chảy máu tươi khi đại tiện"],
        "keywords_en": ["hemorrhoids", "piles", "rectal bleeding", "anal pain", "anal itching", "swollen veins in anus", "blood in stool"],
        "base_confidence": 0.93
    },
    "Phản ứng thuốc (Drug reaction)": {
        "keywords_vi": ["dị ứng thuốc", "phản ứng thuốc", "phát ban sau uống thuốc", "ngứa ngáy sau dùng thuốc", "sưng môi sau uống thuốc", "sốc phản vệ nhẹ"],
        "keywords_en": ["drug reaction", "medicine allergy", "drug allergy", "rash after medication", "swelling after taking medicine", "adverse drug event"],
        "base_confidence": 0.91
    },
    "Nhiễm trùng nấm (Fungal infection)": {
        "keywords_vi": ["nhiễm nấm", "nấm da", "hắc lào", "lang ben", "nấm móng", "nấm bẹn", "vùng da tròn ngứa tróc vảy", "ngứa rát kẽ chân"],
        "keywords_en": ["fungal infection", "fungus", "ringworm", "athletes foot", "tinea", "itchy peeling skin", "white patches on skin"],
        "base_confidence": 0.93
    },
    "Trào ngược dạ dày thực quản (GERD)": {
        "keywords_vi": ["trào ngược", "trào ngược dạ dày", "ợ chua", "ợ nóng", "nóng rát sau xương ức", "đắng miệng", "buồn nôn sau ăn", "cảm giác vướng ở cổ họng"],
        "keywords_en": ["gerd", "acid reflux", "heartburn", "acid regurgitation", "chest burning", "sour taste", "throat lump"],
        "base_confidence": 0.94
    },
    "Cao huyết áp (Hypertension)": {
        "keywords_vi": ["cao huyết áp", "tăng huyết áp", "huyết áp cao", "chóng mặt hoa mắt", "nặng đầu", "đau đầu vùng chẩm", "tim đập nhanh", "đỏ bừng mặt"],
        "keywords_en": ["hypertension", "high blood pressure", "elevated bp", "dizziness", "pounding heart", "throbbing temples", "head fullness"],
        "base_confidence": 0.90
    },
    "Chốc lở (Impetigo)": {
        "keywords_vi": ["chốc lở", "vết loét đóng vảy vàng", "vảy mật ong", "mụn nước quanh miệng", "lở loét ngoài da ở trẻ", "rỉ dịch vàng"],
        "keywords_en": ["impetigo", "yellow crust", "honey colored crust", "sores around mouth", "sores around nose", "crusted sores"],
        "base_confidence": 0.95
    },
    "Vàng da (Jaundice)": {
        "keywords_vi": ["vàng da", "vàng mắt", "mắt vàng", "nước tiểu màu trà đậm", "nước tiểu sẫm màu", "phân bạc màu", "ngứa da kèm vàng da", "men gan cao"],
        "keywords_en": ["jaundice", "yellow skin", "yellow eyes", "icterus", "dark urine", "pale stool", "bilirubin", "liver issue"],
        "base_confidence": 0.94
    },
    "Sốt rét (Malaria)": {
        "keywords_vi": ["sốt rét", "rét run", "sốt từng cơn", "vã mồ hôi sau sốt", "ớn lạnh dữ dội", "sốt rét rừng"],
        "keywords_en": ["malaria", "shivering", "chills", "fever chills cycle", "sweating", "periodic fever", "rigors"],
        "base_confidence": 0.93
    },
    "Đau nửa đầu (Migraine)": {
        "keywords_vi": ["đau nửa đầu", "đau giật một bên đầu", "đau theo nhịp mạch", "sợ ánh sáng", "sợ tiếng động", "hoa mắt trước cơn đau", "migraine"],
        "keywords_en": ["migraine", "throbbing headache", "one sided headache", "pulsating headache", "photophobia", "light sensitivity", "aura"],
        "base_confidence": 0.94
    },
    "Viêm loét dạ dày (Peptic ulcer disease)": {
        "keywords_vi": ["viêm loét dạ dày", "đau dạ dày", "đau bao tử", "đau thượng vị", "đau rát bụng khi đói", "đầy bụng khó tiêu", "buồn nôn nôn mửa", "đau vùng bụng trên"],
        "keywords_en": ["peptic ulcer", "stomach ulcer", "gastric ulcer", "epigastric pain", "burning stomach pain", "hunger pain", "indigestion"],
        "base_confidence": 0.92
    },
    "Viêm phổi (Pneumonia)": {
        "keywords_vi": ["viêm phổi", "ho có đờm đặc", "đờm xanh vàng", "sốt cao rét run", "đau ngực khi ho", "đau ngực khi hít thở sâu", "khó thở thở gấp"],
        "keywords_en": ["pneumonia", "productive cough", "rusty sputum", "green phlegm", "chest pain when coughing", "pleuritic chest pain", "rapid breathing"],
        "base_confidence": 0.93
    },
    "Vẩy nến (Psoriasis)": {
        "keywords_vi": ["vẩy nến", "vảy nến", "mảng đỏ tróc vảy bạc", "mảng da dày cộm", "vảy trắng bạc ở khuỷu tay", "da nứt nẻ chảy máu"],
        "keywords_en": ["psoriasis", "silvery scales", "red scaly patches", "plaques on elbows", "dry cracked scaly skin", "flaking skin"],
        "base_confidence": 0.95
    },
    "Thương hàn (Typhoid)": {
        "keywords_vi": ["thương hàn", "sốt thương hàn", "sốt tăng dần", "đau bụng tiêu chảy kéo dài", "chướng bụng", "mệt lả", "sốt hình bậc thang"],
        "keywords_en": ["typhoid", "typhoid fever", "sustained fever", "step ladder fever", "abdominal tenderness", "rose spots", "constipation or diarrhea"],
        "base_confidence": 0.91
    },
    "Nhiễm trùng đường tiết niệu (Urinary tract infection)": {
        "keywords_vi": ["viêm đường tiết niệu", "tiểu buốt", "tiểu rắt", "tiểu đau", "nước tiểu đục", "tiểu ra máu", "tiểu lắt nhắt", "đau tức bụng dưới khi đi tiểu"],
        "keywords_en": ["uti", "urinary tract infection", "painful urination", "burning urination", "dysuria", "cloudy urine", "frequent urge to urinate"],
        "base_confidence": 0.95
    },
    "Viêm tĩnh mạch (Varicose Veins)": {
        "keywords_vi": ["suy giãn tĩnh mạch", "viêm tĩnh mạch", "nổi gân xanh", "gân ngoằn ngoèo ở chân", "nặng chân", "phù chân", "nhức mỏi bắp chân về chiều"],
        "keywords_en": ["varicose veins", "enlarged veins", "spider veins", "heavy legs", "swollen ankles", "leg aching after standing", "phlebitis"],
        "base_confidence": 0.93
    }
}

def diagnose_by_symptoms_kb(text_vi: str, text_en: str = "") -> tuple[str, float]:
    """
    Thuật toán phân tích và tính trọng số khớp triệu chứng đa ngôn ngữ (Việt - Anh)
    trên toàn bộ 24 bệnh lý trong hệ cơ sở tri thức y khoa MediConnect.
    """
    cleaned_vi = (text_vi or "").lower()
    cleaned_en = (text_en or "").lower()

    best_disease = "Cảm lạnh chung (Common Cold)"
    best_score = 0.0
    best_confidence = 0.85

    for disease_name, info in DISEASE_KNOWLEDGE_BASE.items():
        score = 0

        for kw in info["keywords_vi"]:
            if kw in cleaned_vi:

                score += 3 if len(kw.split()) > 1 else 1.5

        for kw in info["keywords_en"]:
            if kw in cleaned_en:
                score += 3 if len(kw.split()) > 1 else 1.5

        if score > best_score:
            best_score = score
            best_disease = disease_name

            calculated_conf = min(0.98, info["base_confidence"] + min(0.04, (score - 1) * 0.015))
            best_confidence = round(calculated_conf, 4)

    if best_score == 0:
        if any(w in cleaned_vi for w in ["sốt", "nóng sốt", "ho", "mệt", "đau người"]):
            best_disease = "Cảm lạnh chung (Common Cold)"
            best_confidence = 0.88
        elif any(w in cleaned_vi for w in ["đau đầu", "nhức đầu", "chóng mặt"]):
            best_disease = "Đau nửa đầu (Migraine)"
            best_confidence = 0.86
        else:
            best_disease = "Cảm lạnh chung (Common Cold)"
            best_confidence = 0.80

    return best_disease, best_confidence

def run_mediconnect_simulation(message: str, history: List[ChatMessage]):

    if is_meaningless_text(message):
        return {
            "reply": (
                "Tôi chưa hiểu mô tả triệu chứng của bạn. "
                "Vui lòng nhập rõ các triệu chứng bạn đang gặp phải (ví dụ: sốt, ho khan, đau đầu, đau tức ngực, mệt mỏi...) để tôi có thể hỗ trợ chẩn đoán cho bạn nhé."
            )
        }

    patient_messages = [msg for msg in history if msg.role == 'patient']
    user_turn = len(patient_messages) + 1

    all_symptoms = " ".join([msg.text for msg in patient_messages]) + " " + message

    if user_turn == 1:
        return {
            "reply": (
                "Chào bạn, tôi là trợ lý y khoa MediConnect. "
                "Tôi đã ghi nhận triệu chứng ban đầu là: \"" + message + "\". "
                "Bạn có thể cho tôi biết triệu chứng này đã xuất hiện được bao lâu rồi không?"
            )
        }
    elif user_turn == 2:
        return {
            "reply": (
                "Cảm ơn bạn. "
                "Bạn có thể mô tả rõ hơn mức độ nghiêm trọng của cảm giác này không? "
                "(Ví dụ: đau âm ỉ, đau nhói, hay có ảnh hưởng đến sinh hoạt hàng ngày không?)"
            )
        }
    elif user_turn == 3:
        return {
            "reply": (
                "Tôi đã hiểu. "
                "Bạn có kèm theo các triệu chứng nào khác không, ví dụ như sốt, ho, phát ban, buồn nôn hoặc nhức mỏi cơ thể?"
            )
        }
    elif user_turn == 4:
        msg1 = patient_messages[0].text if len(patient_messages) > 0 else message
        msg2 = patient_messages[1].text if len(patient_messages) > 1 else "chưa rõ"
        msg3 = patient_messages[2].text if len(patient_messages) > 2 else "chưa rõ"
        return {
            "reply": (
                "Tóm tắt các triệu chứng bạn đã chia sẻ:\n"
                f"- Triệu chứng chính: {msg1}\n"
                f"- Thời gian kéo dài: {msg2}\n"
                f"- Mức độ/Triệu chứng đi kèm: {msg3}\n\n"
                "Bạn có tiền sử bệnh lý gì đặc biệt hoặc đang sử dụng thuốc nào gần đây không?"
            )
        }
    else:

        predicted_disease, confidence_float = diagnose_by_symptoms_kb(all_symptoms, all_symptoms)
        confidence_percent = int(confidence_float * 100)

        return {
            "reply": (
                f"Cảm ơn bạn đã cung cấp đầy đủ thông tin y tế.\n\n"
                f"Dựa trên các triệu chứng đã trao đổi, đây là kết quả phân tích sơ bộ từ trợ lý AI:\n\n"
                f"Dự đoán bệnh: **{predicted_disease}**\n"
                f"Độ tin cậy: **{confidence_percent}%**\n\n"
                f"Khuyên bệnh nhân tiến hành đặt lịch hẹn khám trực tiếp với bác sĩ chuyên khoa trên MediConnect để được chẩn đoán lâm sàng chính xác nhất."
            )
        }

@app.post("/chat")
async def chat(request: ChatRequest):
    import requests

    api_key = request.api_key

    if not api_key or api_key == "your_gemini_api_key_here" or not api_key.startswith("AIzaSy"):
        return run_mediconnect_simulation(request.message, request.history)

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"

    gemini_contents = []
    for msg in request.history:
        role = "user" if msg.role == "patient" else "model"
        gemini_contents.append({
            "role": role,
            "parts": [{"text": msg.text}]
        })

    gemini_contents.append({
        "role": "user",
        "parts": [{"text": request.message}]
    })

    system_instruction = (
        "Bạn là trợ lý y khoa MediConnect, một trợ lý y khoa AI chuyên nghiệp. "
        "Nhiệm vụ của bạn là lắng nghe triệu chứng bệnh nhân, trò chuyện thân thiện và hỏi chi tiết một cách có hệ thống theo các bước sau:\n"
        "1. Trong 3 lượt hội thoại đầu tiên: Hãy hỏi ít nhất 3 câu hỏi (mỗi lượt trả lời chỉ đặt 1 câu hỏi làm rõ ngắn gọn, rõ ràng) để tìm hiểu sâu về triệu chứng chính mà bệnh nhân chia sẻ (tần suất, mức độ, thời gian bắt đầu).\n"
        "2. Ở lượt trả lời thứ 4: Hãy đưa ra tóm tắt ngắn gọn các triệu chứng ban đầu mà bạn ghi nhận được. Sau đó, tiếp tục hỏi thêm vài câu hỏi (ít nhất 2 câu hỏi nữa ở các lượt tiếp theo) để tìm hiểu kỹ hơn về các triệu chứng đi kèm khác hoặc tiền sử bệnh lý của bệnh nhân.\n"
        "3. Chỉ sau khi đã hỏi đủ các bước trên (tối thiểu cuộc hội thoại đạt từ 5-6 lượt trao đổi qua lại giữa bạn và bệnh nhân): Bạn mới được phép kết luận dự đoán bệnh lý của họ theo cấu trúc chính xác sau ở cuối câu trả lời:\n"
        "Dự đoán bệnh: **[Tên bệnh bằng tiếng Việt] ([Tên bệnh bằng tiếng Anh])**\n"
        "Độ tin cậy: **[Số từ 0-100]%**\n"
        "Khuyên bệnh nhân tiến hành đặt lịch hẹn khám trực tiếp với bác sĩ chuyên khoa trên MediConnect để được tư vấn chính xác."
    )

    payload = {
        "contents": gemini_contents,
        "systemInstruction": {
            "parts": [{"text": system_instruction}]
        }
    }

    try:
        response = requests.post(url, json=payload, timeout=12)
        response.raise_for_status()
        data = response.json()

        reply_text = data['candidates'][0]['content']['parts'][0]['text']
        return {"reply": reply_text}
    except Exception as e:
        print(f"❌ Lỗi gọi Gemini API: {str(e)}")

        return run_mediconnect_simulation(request.message, request.history)

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: SymptomRequest):
    global tokenizer, ort_session, translator

    if not request.text or not request.text.strip() or is_meaningless_text(request.text):
        raise HTTPException(
            status_code=400,
            detail="Tôi chưa hiểu mô tả triệu chứng của bạn. Vui lòng nhập rõ các triệu chứng bệnh bạn đang gặp phải (ví dụ: sốt, ho, đau đầu, mệt mỏi...)"
        )

    if tokenizer is None:
        raise HTTPException(status_code=503, detail="Tokenizer chưa sẵn sàng.")

    try:

        try:
            translated_text = translator.translate(request.text)
            print(f"Input (VI): {request.text} -> Translated (EN): {translated_text}")
        except Exception as trans_err:
            print(f"[WARNING] Lỗi dịch thuật: {str(trans_err)}. Sử dụng văn bản gốc.")
            translated_text = request.text

        if ort_session is not None:

            inputs = tokenizer(
                translated_text,
                max_length=128,
                padding="max_length",
                truncation=True,
                return_tensors="np"
            )

            ort_inputs = {
                "input_ids": inputs["input_ids"].astype(np.int64),
                "attention_mask": inputs["attention_mask"].astype(np.int64)
            }

            ort_outs = ort_session.run(None, ort_inputs)
            logits = ort_outs[0]

            exp_logits = np.exp(logits - np.max(logits, axis=1, keepdims=True))
            probabilities = exp_logits / np.sum(exp_logits, axis=1, keepdims=True)

            class_idx = np.argmax(probabilities, axis=1)[0]
            confidence = float(probabilities[0, class_idx])

            if class_idx < 0 or class_idx >= len(DISEASE_CLASSES):
                raise ValueError(f"Chỉ mục dự đoán {class_idx} nằm ngoài mảng nhãn.")

            predicted_disease = DISEASE_CLASSES[class_idx]
        else:

            predicted_disease, confidence = diagnose_by_symptoms_kb(request.text, translated_text)

        return PredictionResponse(
            disease=predicted_disease,
            confidence=round(confidence, 4),
            translated_text_used=translated_text
        )

    except Exception as e:
        print(f"[ERROR] Lỗi suy diễn ONNX: {str(e)}", file=sys.stderr)
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi xử lý AI: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
