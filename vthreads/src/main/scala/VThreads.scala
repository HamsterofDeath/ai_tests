object VThreads {
  @main def run(): Unit = {
    Thread.ofVirtual().start(() => {
      println("hi")
    }).join()
  }
}
