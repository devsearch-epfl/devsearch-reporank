package pagerank
import org.apache.spark.rdd.RDD


object PageRanker {
  
  type Contributor = String;
  case class Repo(user : String, project : String){
    override def toString() = s"$user/$project"
  }
  
  case class Star(contributor : Contributor, repo : Repo)
  case class Contribution(repo: Repo, contributor : Contributor, times : Int)
  
  def main(args: Array[String]): Unit = {
   val contributors : RDD[Contributor] = ???
    val repos = ???
    
    
    
  }
  
  
}