# Local image generation

The server uses the community NF4 quantization of the FLUX.2 Klein 4B image
transformer and quantizes the official Qwen text encoder to NF4 when loading.
The community repository currently omits that encoder's weights. The first
startup downloads both repositories from Hugging Face. On this RTX 5060 Laptop,
the pipeline used about 6 GB of VRAM during generation.

## Windows setup

Install `uv` and a current NVIDIA driver, then from this directory run:

```powershell
uv python install 3.11 --install-dir .python
uv venv --python .python\cpython-3.11-windows-x86_64-none\python.exe .venv
uv pip install --python .venv\Scripts\python.exe torch --index-url https://download.pytorch.org/whl/cu128
uv pip install --python .venv\Scripts\python.exe -r requirements.txt
.venv\Scripts\python -m uvicorn server:app --host 127.0.0.1 --port 7860
```

Set `LOCAL_IMAGE_API_URL=http://127.0.0.1:7860` in the app's `.env.local` and
restart Next.js. When this variable is set, image generation uses the local
server; otherwise it continues to use Cloudflare. The server binds only to
localhost and keeps the loaded model in GPU memory between requests.

The first model download is several gigabytes. Keep other GPU-heavy apps closed
on an 8 GB card. The initial diffusion pipeline API supports the app's prompt,
512 px dimensions, four-step generation, and up to four reference images.

Image transformer: <https://huggingface.co/cukrus/FLUX.2-klein-4B-bnb-nf4>.
Official text encoder: <https://huggingface.co/black-forest-labs/FLUX.2-klein-4B>.
Both are Apache 2.0.
