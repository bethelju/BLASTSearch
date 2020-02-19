# BLASTSearch
A Web App to perform and manage Blast Searches

## How do I access the page?
The link is here: https://calm-caverns-14471.herokuapp.com/

## I can't find my search! 
While your search is processing, it may be down the page a litle bit. You can referesh the page to update the status of the search. 

## What is a BLAST Search?
The National Institute of Biotechnology information hosts an API that allows you to submit an amino acid sequence and it will return the protein
with the closest match to that sequence. You can send an HTTP GET request with a search query to the NCBI web server and it will run a search for you 
on their databases. The backend will continuously check whether the search is completed and return the results when it is. 

## Why did you make this?
I made it when I was first learning web development to solidify my knowledge of some back-end functionalities such as accessing API's 
and managing a database. I used a nodeJS backend with a mongoDB database to store the results of the API call. 
