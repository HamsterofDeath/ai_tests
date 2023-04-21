import play.api.libs.json.{Format, Json}
import reactivemongo.api.bson.collection.BSONCollection
import reactivemongo.api.bson.{BSONDocument, BSONString, Macros}
import reactivemongo.api.{AsyncDriver, DB, MongoConnection}
import spark.Spark._
import spark.{Request, Response}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration.Duration
import scala.concurrent.{Await, Future}

object WebMapScala {
  val mongoUri = "mongodb://localhost:27017/hashmap_db"
  val driver = AsyncDriver()
  val parsedUri = MongoConnection.fromString(mongoUri)
  val connection = parsedUri.flatMap(e => driver.connect(e))
  val futureConnection = connection

  def database: Future[DB] = futureConnection.flatMap(_.database("hashmap_db"))

  def hashmap = database.map(_.collection[BSONCollection]("hashmap"))

  case class ValueRequest(value: String)

  case class ValueResponse(value: String)

  case class SuccessResponse(success: Boolean)

  case class ErrorResponse(error: String)

  implicit val valueRequestFormat: Format[ValueRequest] = Json.format[ValueRequest]
  implicit val valueResponseFormat: Format[ValueResponse] = Json.format[ValueResponse]
  implicit val successResponseFormat: Format[SuccessResponse] = Json.format[SuccessResponse]
  implicit val errorResponseFormat: Format[ErrorResponse] = Json.format[ErrorResponse]

  implicit val valueRequestWriter = Macros.writer[ValueRequest]
  implicit val valueRequestReader = Macros.reader[ValueRequest]
  implicit val valueResponseWriter = Macros.writer[ValueResponse]
  implicit val valueResponseReader = Macros.reader[ValueResponse]

  def main(args: Array[String]): Unit = {
    get("/:key", (req: Request, res: Response) => {
      val key = req.params(":key")
      val query = BSONDocument("_id" -> key)

      val futureResult = hashmap.flatMap(_.find(query).one[ValueResponse])

      Await.result(futureResult.map {
        case Some(result) =>
          res.`type`("application/json")
          Json.stringify(Json.toJson(result))
        case None =>
          res.status(404)
          Json.stringify(Json.toJson(ErrorResponse("Key not found")))
      }, Duration.Inf)
    })

    put("/:key", (req: Request, res: Response) => {
      val key = req.params(":key")
      val valueRequest = Json.parse(req.body()).as[ValueRequest]

      val selector = BSONDocument("_id" -> key)
      val modifier = BSONDocument("$set" -> BSONDocument("value" -> BSONString(valueRequest.value)))
      val futureResult = hashmap.flatMap(_.update.one(selector, modifier, upsert = true))

      res.`type`("application/json")
      Json.stringify(Json.toJson(Await.result(futureResult.map(_ => SuccessResponse(true)), Duration.Inf)))
    })

    delete("/:key", (req: Request, res: Response) => {
      val key = req.params(":key")
      val selector = BSONDocument("_id" -> key)

      val futureResult = hashmap.flatMap(_.delete.one(selector))

      Await.result(futureResult.map { result =>
        if (result.n > 0) {
          res.`type`("application/json")
          Json.stringify(Json.toJson(SuccessResponse(true)))
        } else {
          res.status(404)
          Json.stringify(Json.toJson(ErrorResponse("Key not found")))
        }
      }, Duration.Inf)
    })
  }
}
