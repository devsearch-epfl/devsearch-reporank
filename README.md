# devsearch-reporank
PageRank adaptation for github repositories

## How it works
We use an adaptation of Google's PageRank where "User Stars Repo" and "Repo Has Contributors" relations are used in the random walker algorithm.

### BigQuery and GithubArchive
There is a very huge number of "User Stars Repo" and "Repo Has Contributors" relations. They are almost unpossible to crawl from Github API with normal access tokens. Thus we fetch them using [Github Archive](https://www.githubarchive.org/) that stores every Github Events since 01.01.2011. Among those event we are interested in **Watch Events** and **Push Events**.

[Github Archive](https://www.githubarchive.org/) give access to their content through [Google Big Query](https://developers.google.com/bigquery/) where we can perform large distributed queries.

### PageRank Adaptation
Each step consist of 2 steps, spreading User notoriety to Repository and then spreading Repository notoriety to Users.

## Usage

### BigQuery and GithubArchive
* Go to [BigQuery](https://bigquery.cloud.google.com)
* Run each of the following queries (2 different queries for before and after 2015 and another one for merging)
* Store the result in a Bucket on Google [Cloud Stolrage](https://cloud.google.com/storage/)
* Download the data localy in csv

#### Whatch Events
For events **before 01.01.2015**: (save to `githubstars.stars_11_14`)
```
SELECT actor_attributes_login as login, REGEXP_EXTRACT(repository_url,r'\/([\w\d_\-\.]+\/[\w\d_\-\.]+)$') as repo, COUNT(*) as nb  FROM
  TABLE_QUERY([githubarchive:month],
    'REGEXP_MATCH(table_id, r"^201[1|2|3|4]\d+")'
  )
WHERE
  type = "WatchEvent"
GROUP EACH BY
  login, repo
```
For events **since 01.01.2015**: (save to `githubstars.stars_15`)
```
SELECT
  actor_login as login, repo_name as repo, COUNT(*) as nb  FROM
TABLE_QUERY
  ([githubarchive:month],
    'REGEXP_MATCH(table_id, r"^2015\d\d")'
  )
WHERE
  type = "WatchEvent"
GROUP EACH BY
  login, repo
```
Merging both:
```
SELECT
  login, repo, SUM(nb)
FROM
  githubstars.stars_11_14, githubstars.stars_15
GROUP EACH BY
  login, repo
```

#### Push Events
For events **before 01.01.2015**: (save to `githubcontribs.contribs_11_14`)
```
SELECT actor as login, REGEXP_EXTRACT(repository_url,r'\/([\w\d_\-\.]+\/[\w\d_\-\.]+)$') as repo, COUNT(*) as nb  FROM
  TABLE_QUERY([githubarchive:month],
    'REGEXP_MATCH(table_id, r"^201[1234]\d\d$")'
  )
WHERE
  type = "PushEvent"
GROUP EACH BY
  login, repo
```
For events **since 01.01.2015**: (save to `githubcontribs.contribs_15`)
```
SELECT
  actor_login as login, repo_name as repo, COUNT(*) as nb  FROM
TABLE_QUERY
  ([githubarchive:month],
    'REGEXP_MATCH(table_id, r"^2015\d\d")'
  )
WHERE
  type = "PushEvent"
GROUP EACH BY
  login, repo;
```
Merging the two:
```
SELECT
  login, repo, SUM(nb)
FROM
  githubcontribs.contribs_11_14, githubcontribs.contribs_15
GROUP EACH BY
  login, repo
```

### Spark

### NodeJs crawler
This is a prototype of a crawler for githubAPI. It is working but is restrained by API limits (5k calls per day)
To run it you just need to
* Have node.js installed
* Replace the placeholders with your API token in `crawler.js`
* Run `node star-crawler/main.js`

