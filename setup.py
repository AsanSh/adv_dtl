from setuptools import setup, find_packages

setup(
    name="dtl-logistics",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi==0.104.1",
        "uvicorn==0.24.0",
        "pymongo==4.6.0",
        "python-telegram-bot==20.7",
        "python-dotenv==1.0.0",
        "pydantic[email]==2.5.2",
        "motor==3.3.2",
        "python-jose==3.3.0",
        "passlib==1.7.4",
        "bcrypt==4.0.1",
        "gunicorn==21.2.0",
        "dnspython==2.4.2",
        "email-validator==2.1.0.post1",
    ],
) 