ThisBuild / version := "0.1.0-SNAPSHOT"

ThisBuild / scalaVersion := "3.2.2"

lazy val root = (project in file("."))
  .settings(
    name := "vthreads",
    scalacOptions ++= Seq("--enable-preview"),
    Compile / run / fork := true,
    Compile / run / javaOptions ++= Seq("--enable-preview")
  )
