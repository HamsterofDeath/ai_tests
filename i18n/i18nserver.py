from typing import List

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pymongo import MongoClient

app = FastAPI()

client = MongoClient("mongodb://localhost:27017/")
db = client["i18n"]
translations_collection = db["translations"]


class Translation(BaseModel):
    bundle: str
    locale: str
    key: str
    value: str


def find_translation(bundle: str, locale: str, key: str):
    return translations_collection.find_one({"bundle": bundle, "locale": locale, "key": key})


def find_translations(bundle: str, locale: str):
    return list(translations_collection.find({"bundle": bundle, "locale": locale}))


@app.get("/translations/{bundle}/locales/{locale}/keys/{key}")
async def get_translation(bundle: str, locale: str, key: str):
    translation = find_translation(bundle, locale, key)
    if translation:
        return translation["value"]
    raise HTTPException(status_code=404, detail="Translation not found")


@app.put("/translations/{bundle}/locales/{locale}/keys/{key}")
async def set_translation(bundle: str, locale: str, key: str, value: str):
    existing_translation = find_translation(bundle, locale, key)
    if existing_translation:
        translations_collection.update_one(
            {"bundle": bundle, "locale": locale, "key": key},
            {"$set": {"value": value}},
        )
    else:
        translations_collection.insert_one(
            {"bundle": bundle, "locale": locale, "key": key, "value": value}
        )
    return {"status": "success"}


@app.delete("/translations/{bundle}/locales/{locale}/keys/{key}")
async def delete_translation(bundle: str, locale: str, key: str):
    translation = find_translation(bundle, locale, key)
    if translation:
        translations_collection.delete_one({"_id": translation["_id"]})
        return {"status": "success"}
    raise HTTPException(status_code=404, detail="Translation not found")


@app.get("/translations/{bundle}/locales/{locale}/keys")
async def get_keys(bundle: str, locale: str):
    translations = find_translations(bundle, locale)
    return [t["key"] for t in translations]


@app.put("/translations/batch_upsert")
async def batch_upsert(translations: List[Translation]):
    for translation in translations:
        translations_collection.update_one(
            {"bundle": translation.bundle, "locale": translation.locale, "key": translation.key},
            {"$set": {"value": translation.value}},
            upsert=True
        )
    return {"status": "success"}
