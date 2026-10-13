FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --retries 10 --timeout 60 -r requirements.txt && useradd --create-home app
COPY app.py .
USER app
EXPOSE 4300
CMD ["uvicorn","app:app","--host","0.0.0.0","--port","4300"]
