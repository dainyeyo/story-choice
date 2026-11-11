# Local image generation

The server uses the community NF4 quantization of FLUX.2 Klein 4B. The model
weights and Qwen text encoder together use about 5.1 GB; leave additional VRAM
for image generation. First startup downloads the model from Hugging Face.

## Windows setup

Install a current NVIDIA driver and Python 3.11, then from this directory run:

```powershell
py -3.11 -m venv .venv
.venv\Scripts\python -m pip install --upgrade pip
.venv\Scripts\python -m pip install torch --index-url https://download.pytorch.org/whl/cu128
.venv\Scripts\python -m pip install -r requirements.txt
.venv\Scripts\python -m uvicorn server:app --host 127.0.0.1 --port 7860
```

Set `LOCAL_IMAGE_API_URL=http://127.0.0.1:7860` in the app's `.env.local` and
restart Next.js. When this variable is set, image generation uses the local
server; otherwise it continues to use Cloudflare. The server binds only to
localhost and keeps the loaded model in GPU memory between requests.

The first model download is several gigabytes. Keep other GPU-heavy apps closed
on an 8 GB card. The initial diffusion pipeline API supports the app's prompt,
512 px dimensions, four-step generation, and up to four reference images.

Model: <https://huggingface.co/cukrus/FLUX.2-klein-4B-bnb-nf4>. This community
NF4 conversion is Apache 2.0 and includes both the transformer and text encoder.
