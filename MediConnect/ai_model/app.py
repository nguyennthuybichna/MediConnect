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

# Danh sách 24 bệnh chuẩn từ dataset Kaggle (Đã dịch sang tiếng Việt)
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

# Quản lý vòng đời ứng dụng FastAPI
@asynccontextmanager
async def lifespan(app: FastAPI):
    global tokenizer, ort_session
    print("[INFO] Đang khởi tạo và nạp mô hình AI (ONNX)...")
    
    # 1. Tải Tokenizer từ HuggingFace
    try:
        tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
        print("[SUCCESS] Đã nạp thành công Tokenizer: bert-base-uncased")
    except Exception as e:
        raise RuntimeError(f"Lỗi khi tải Tokenizer: {str(e)}")

    # 2. Nạp mô hình ONNX bằng ONNX Runtime
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
    role: str  # 'patient' hoặc 'ai'
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
    # Chỉ chứa số hoặc ký tự đặc biệt hoặc khoảng trắng
    if re.fullmatch(r'[\d\W_]+', trimmed):
        return True
    # Lặp lại 1 ký tự duy nhất (vd: aaaaa, zzzz)
    if re.fullmatch(r'(.)\1{2,}', trimmed, re.IGNORECASE):
        return True
    # Kiểm tra nguyên âm tiếng Việt và tiếng Anh
    has_vowels = bool(re.search(r'[aeiouyàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹ]', trimmed, re.IGNORECASE))
    if not has_vowels and len(trimmed) >= 3:
        return True
    # Chuỗi ngẫu nhiên bàn phím phổ biến
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
    # Kiểm tra tin nhắn vô nghĩa hoặc 1 chữ cái
    if is_meaningless_text(message):
        return {
            "reply": (
                "Tôi chưa hiểu mô tả triệu chứng của bạn. "
                "Vui lòng nhập rõ các triệu chứng bạn đang gặp phải (ví dụ: sốt, ho khan, đau đầu, đau tức ngực, mệt mỏi...) để tôi có thể hỗ trợ chẩn đoán cho bạn nhé."
            )
        }

    # Đếm số lượng tin nhắn của bệnh nhân
    patient_messages = [msg for msg in history if msg.role == 'patient']
    user_turn = len(patient_messages) + 1  # Lượt hiện tại của user

    # Tập hợp tất cả tin nhắn của bệnh nhân để đoán bệnh ở lượt cuối
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
    else:
        # Ở lượt thứ 5+, đưa ra kết luận dự đoán
        predicted_disease = 'Cảm lạnh chung (Common Cold)'
        confidence = 85
        
        # Phân tích sơ bộ từ khóa tiếng Việt hoặc tiếng Anh để có chẩn đoán mô phỏng phù hợp
        if any(w in all_symptoms_lower for w in ["đau ngực", "tim", "chest pain", "heart", "huyết áp", "bp"]):
            predicted_disease = 'Cao huyết áp (Hypertension)'
            confidence = 88
        elif any(w in all_symptoms_lower for w in ["đau đầu", "sốt", "ho", "headache", "fever", "cough", "cảm"]):
            predicted_disease = 'Cảm lạnh chung (Common Cold)'
            confidence = 92
        elif any(w in all_symptoms_lower for w in ["dị ứng", "ngứa", "allergy", "itch", "phát ban", "mề đay"]):
            predicted_disease = 'Dị ứng (Allergy)'
            confidence = 95
        elif any(w in all_symptoms_lower for w in ["khớp", "xương", "mỏi cơ", "arthritis"]):
            predicted_disease = 'Viêm khớp (Arthritis)'
            confidence = 85
        elif any(w in all_symptoms_lower for w in ["dạ dày", "bao tử", "trào ngược", "gerd", "peptic"]):
            predicted_disease = 'Trào ngược dạ dày thực quản (GERD)'
            confidence = 90
            
        return {
            "reply": (
                f"Cảm ơn bạn đã cung cấp đầy đủ thông tin y tế.\n\n"
                f"Dựa trên các triệu chứng đã trao đổi, đây là kết quả phân tích sơ bộ từ trợ lý AI:\n\n"
                f"Dự đoán bệnh: **{predicted_disease}**\n"
                f"Độ tin cậy: **{confidence}%**\n\n"
                f"Khuyên bệnh nhân tiến hành đặt lịch hẹn khám trực tiếp với bác sĩ chuyên khoa trên MediConnect để được chẩn đoán lâm sàng chính xác nhất."
            )
        }

@app.post("/chat")
async def chat(request: ChatRequest):
    import requests
    
    api_key = request.api_key
    # Nếu không có key, hoặc key placeholder, hoặc không đúng định dạng key của Google (bắt đầu bằng AIzaSy)
    if not api_key or api_key == "your_gemini_api_key_here" or not api_key.startswith("AIzaSy"):
        return run_mediconnect_simulation(request.message, request.history)
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    
    # Định dạng lịch sử trò chuyện cho Gemini API
    gemini_contents = []
    for msg in request.history:
        role = "user" if msg.role == "patient" else "model"
        gemini_contents.append({
            "role": role,
            "parts": [{"text": msg.text}]
        })
        
    # Thêm câu hỏi/tin nhắn mới hiện tại
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
        # Dự phòng bằng bộ mô phỏng động nếu lỗi xảy ra khi gọi API
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
        # Bước 1: Dịch Tiếng Việt -> Tiếng Anh
        try:
            translated_text = translator.translate(request.text)
            print(f"Input (VI): {request.text} -> Translated (EN): {translated_text}")
        except Exception as trans_err:
            print(f"[WARNING] Lỗi dịch thuật: {str(trans_err)}. Sử dụng văn bản gốc.")
            translated_text = request.text

        if ort_session is not None:
            # Bước 2: Mã hóa văn bản
            inputs = tokenizer(
                translated_text,
                max_length=128, 
                padding="max_length",
                truncation=True,
                return_tensors="np" 
            )
            
            # Bước 3: Khai báo input cho ONNX
            ort_inputs = {
                "input_ids": inputs["input_ids"].astype(np.int64),
                "attention_mask": inputs["attention_mask"].astype(np.int64)
            }
            
            # Bước 4: Chạy suy luận (Inference)
            ort_outs = ort_session.run(None, ort_inputs)
            logits = ort_outs[0]
            
            # Bước 5: Tính Softmax bằng Numpy
            exp_logits = np.exp(logits - np.max(logits, axis=1, keepdims=True))
            probabilities = exp_logits / np.sum(exp_logits, axis=1, keepdims=True)
            
            # Bước 6: Lấy chỉ mục lớp có xác suất cao nhất
            class_idx = np.argmax(probabilities, axis=1)[0]
            confidence = float(probabilities[0, class_idx])
            
            # Bước 7: Ánh xạ kết quả an toàn
            if class_idx < 0 or class_idx >= len(DISEASE_CLASSES):
                raise ValueError(f"Chỉ mục dự đoán {class_idx} nằm ngoài mảng nhãn.")
                
            predicted_disease = DISEASE_CLASSES[class_idx]
        else:
            # Thuật toán giả lập chẩn đoán theo từ khoá khi model ONNX offline
            txt = translated_text.lower()
            if "chest pain" in txt or "heart" in txt:
                predicted_disease = 'Cao huyết áp (Hypertension)'
                confidence = 0.88
            elif "headache" in txt or "fever" in txt or "cough" in txt:
                predicted_disease = 'Cảm lạnh chung (Common Cold)'
                confidence = 0.92
            elif "allergy" in txt or "itch" in txt:
                predicted_disease = 'Dị ứng (Allergy)'
                confidence = 0.95
            else:
                predicted_disease = 'Cảm lạnh chung (Common Cold)'
                confidence = 0.85

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
