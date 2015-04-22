
package pagerank

import org.apache.spark.rdd.RDD
import org.apache.spark._
import org.apache.spark.SparkContext._

object PageRanker {

  type Coder = String
  //  case class Repo(user: String, project: String) {
  //    override def toString() = s"$user/$project"
  //  }
  type Repo = String
  case class Star(user: Coder, repo: Repo) extends Serializable
  case class Commit(repo: Repo, contributor: Coder, times: Int) extends Serializable

  def main(args: Array[String]): Unit = {

    val sc = new SparkContext(new SparkConf().setAppName("PageRanker")set("spark.hadoop.validateOutputSpecs", "false"))
    //val contribLines = sc.textFile("hdfs:///user/bjacot/data/commit_test.csv")
    //val starLines = sc.textFile("hdfs:///user/bjacot/data/star_test.csv")
    
    
    val contribLines = sc.textFile("hdfs:///user/bjacot/data/contribs_gh-contribs-*.csv")
    val starLines = sc.textFile("hdfs:///user/bjacot/data/stars_gh-stars-*.csv")
    val stars = starLines.flatMap{line => 
      val split = line.split(",")
      if(split.size == 3 && split(2).forall(_.isDigit)) Some(Star(split(0), split(1)))
      else None
    }
    
    val commits: RDD[Commit] = contribLines.flatMap{line => 
      val split = line.split(",")
      if(split.size == 3 && split(2).forall(_.isDigit)) Some(Commit(split(1), split(0), split(2).toInt))
      else None
    }

    val coders: RDD[Coder] = (commits.map(_.contributor) ++ stars.map(_.user)).distinct().cache()
    val repos: RDD[Repo] = (commits.map(_.repo) ++ stars.map(_.repo)).distinct().cache
    val nbCoder = coders.count()
    val nbRepo = repos.count()
    
    val coderToRepo = stars.map(star => star.user -> star.repo).groupByKey().cache
    val repoToCoder = commits.map(commit => commit.repo -> (commit.contributor, commit.times.toDouble)).groupByKey().
      map { case (repo, list) => (repo, list.map { case (coder, times) => (coder, times / list.map(_._2).sum) }) }.cache
    val iterations = 1
    val alpha = 0.15
    val epsilon = 0.001
    val initialValue = repos.map(repo => repo -> 1.0)
    def pageRankIteration(repoScore: RDD[(Repo, Double)]): RDD[(Repo, Double)] = {
      val coderScore = (coders.map(x => x -> 0.0) ++ repoScore.leftOuterJoin(repoToCoder).flatMap {
        case (_, (score, Some(list))) => list.map { case (x, y) => x -> y * score }
        case (_, (score, None)) => Nil //coders.map(coder => coder -> score / nbCoder).collect()
      }).reduceByKey(_ + _)
      val coderLost = (nbRepo.toDouble - coderScore.values.sum) / coderScore.count
      val exactCoderScore = coderScore.mapValues( x => x + coderLost )
      val total = exactCoderScore.values.sum
      //assert(total == nbRepo.toDouble, s"$total != $nbRepo") 
      val nextScore = (repos.map(x => x -> 0.0) ++ exactCoderScore.leftOuterJoin(coderToRepo).flatMap{
        case (_, (score, Some(list))) => list.map(repo => repo -> score / list.size)
        case (_, (score, None)) => Nil //repos.map(repo => repo -> score / nbRepo).collect()
      }).reduceByKey(_ + _)
      val lostRepo = (nbRepo.toDouble - nextScore.values.sum) / nextScore.count
      val exactScore = nextScore.mapValues(score => (score + lostRepo))
      //assert(exactScore.values.sum == nbRepo.toDouble)
      exactScore.mapValues(score => (1 - alpha) * score + alpha)
    }
    
    def convergence(current : RDD[(Repo, Double)]) : RDD[(Repo, Double)] = {      
      val next = pageRankIteration(current)
      val diff = current.join(next).values.map{case (x,y) => (x - y).abs}.sum / nbRepo
      if(diff < epsilon) next
      else convergence(next)
    }
      
    val score = convergence(initialValue)
    score.map{case (repo, value) => s"$repo,$value"}.saveAsTextFile("ranking")
  }


}