from pathlib import Path
import shutil
for name in ['rag','chatbot','agent']:
    path=Path('services')/name
    path.mkdir(parents=True,exist_ok=True)
    (path/'tests').mkdir(exist_ok=True)
    (path/'.dockerignore').write_text('.env\n.env.*\n.venv\n__pycache__\ntests\n',encoding='utf8')
    for filename in ['app.py','requirements.txt','Dockerfile','test_security.py']:
        source=Path('tooling/ai-templates')/filename
        destination=path/('tests/test_security.py' if filename=='test_security.py' else filename)
        destination.write_text(source.read_text(encoding='utf8').replace('__MODULE__',name),encoding='utf8')
    (path/'README.md').write_text(f'# {name} service\n\nIndependent FastAPI application. Own database, role, requirements and image. Run `uvicorn app:app --port 4300`. Run `python -m unittest discover -s tests`. Uses authenticated HTTP contracts, never sibling imports.\n',encoding='utf8')
