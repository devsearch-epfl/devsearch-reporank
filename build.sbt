name := "devsearch-reporank"

shellPrompt := { state => "[\033[36m" + name.value + "\033[0m] $ " }

version := "1.0"

scalaVersion := "2.10.4"

libraryDependencies += "org.apache.spark" %% "spark-core" % "1.2.1"

libraryDependencies += "org.scalatest" % "scalatest_2.10" % "2.2.4" % "test"

target in Compile in doc := baseDirectory.value / "api"
