import com.google.gson.Gson;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.UpdateOptions;
import com.mongodb.client.result.DeleteResult;
import org.bson.Document;

import static com.mongodb.client.model.Filters.eq;
import static spark.Spark.*;

public class WebMap {
    public static void main(String[] args) {
        MongoClient mongoClient = MongoClients.create("mongodb://localhost:27017");
        MongoDatabase database = mongoClient.getDatabase("hashmap_db");
        MongoCollection<Document> hashmap = database.getCollection("hashmap");

        Gson gson = new Gson();

        get("/:key", (req, res) -> {
            String key = req.params(":key");
            Document result = hashmap.find(eq("_id", key)).first();
            if (result != null) {
                res.type("application/json");
                return gson.toJson(new ValueResponse(result.getString("value")));
            } else {
                res.status(404);
                return gson.toJson(new ErrorResponse("Key not found"));
            }
        });

        put("/:key", (req, res) -> {
            String key = req.params(":key");
            ValueRequest valueRequest = gson.fromJson(req.body(), ValueRequest.class);
            if (valueRequest == null || valueRequest.value == null) {
                res.status(400);
                return gson.toJson(new ErrorResponse("Value is required"));
            }

            hashmap.updateOne(eq("_id", key),
                    new Document("$set", new Document("value", valueRequest.value)), new UpdateOptions().upsert(true));
            res.type("application/json");
            return gson.toJson(new SuccessResponse(true));
        });

        delete("/:key", (req, res) -> {
            String key = req.params(":key");
            DeleteResult result = hashmap.deleteOne(eq("_id", key));
            if (result.getDeletedCount() > 0) {
                res.type("application/json");
                return gson.toJson(new SuccessResponse(true));
            } else {
                res.status(404);
                return gson.toJson(new ErrorResponse("Key not found"));
            }
        });
    }

    static class ValueRequest {
        String value;
    }

    static class ValueResponse {
        String value;

        public ValueResponse(String value) {
            this.value = value;
        }
    }

    static class SuccessResponse {
        boolean success;

        public SuccessResponse(boolean success) {
            this.success = success;
        }
    }

    static class ErrorResponse {
        String error;

        public ErrorResponse(String error) {
            this.error = error;
        }
    }
}
