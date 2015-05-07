#!/usr/bin/env bash

set -x

# get current scaladoc dir
path=${PWD}
folder=${path##*/}
scaladoc=${path}/target/scala-2.10/api/

# clone repo
git clone https://github.com/devsearch-epfl/devsearch-doc.git


# clean and make new dir
scaladocdir=${PWD}/devsearch-doc/${folder}/scaladoc/
rm -rf ${scaladocdir}
mkdir -p ${scaladocdir}

# copy scaladoc over
cp -rv ${scaladoc}/* ${scaladocdir}

# step into repo
cd devsearch-doc/

# mark for add and commit
git add ${folder}/scaladoc/*
git commit -m "Updating scaladoc for ${folder}"
git push origin gh-pages

# clean up bdg repo
cd ..
rm -rf devsearch-doc/