from flask import Flask, request, jsonify
from pymongo import MongoClient

app = Flask(__name__)
client = MongoClient("mongodb://localhost:27017")
db = client.hashmap_db
hashmap = db.hashmap

@app.route('/<key>', methods=['GET'])
def get_value(key):
    result = hashmap.find_one({"_id": key})
    if result:
        return jsonify(value=result["value"])
    else:
        return jsonify(error="Key not found"), 404

@app.route('/<key>', methods=['PUT'])
def put_value(key):
    value = request.json.get("value")
    if value is None:
        return jsonify(error="Value is required"), 400

    hashmap.update_one({"_id": key}, {"$set": {"value": value}}, upsert=True)
    return jsonify(success=True)

@app.route('/<key>', methods=['DELETE'])
def delete_value(key):
    result = hashmap.delete_one({"_id": key})
    if result.deleted_count > 0:
        return jsonify(success=True)
    else:
        return jsonify(error="Key not found"), 404

if __name__ == '__main__':
    app.run()
