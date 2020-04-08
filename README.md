# wahoo-n
NodeJS web service for IRI RowGen.

For an example, run a curl commend from the *test* directory.

`curl -s --data-binary @10.rcl -H "Content-Type: text/plain" http://localhost:3000/script`

The result will be the output of the script as scraped from stdout. This is a sample of two formatted records from the output :

```
[
  {
    "FakeText": "bhqcx",
    "FakeNum": {
      "A": 39,
      "B": 4012
    }
  },
  {
    "FakeText": "eqzramkr",
    "FakeNum": {
      "A": 58,
      "B": 1258
    }
  }
]
```

The RowGen script, *10.rcl*, which produces the random records:

```
/INFILE=random
    /PROCESS=RANDOM
    /INCOLLECT=10
    /FIELD=(FAKETEXT, TYPE=LOWER, POSITION=1, SEPARATOR="\t", MIN_SIZE=4, MAX_SIZE=10, JDEF="FakeText")
    /FIELD=(FAKENUM1, TYPE=WHOLE, POSITION=2, SIZE=2, SEPARATOR="\t", JDEF="FakeNum.A")
    /FIELD=(FAKENUM2, TYPE=WHOLE, POSITION=3, SIZE=4, SEPARATOR="\t", JDEF="FakeNum.B")

/SORT

/OUTFILE=stdout
    /PROCESS=JSON
    /FIELD=(FAKETEXT, TYPE=ASCII, POSITION=1, SEPARATOR="\t", JDEF="FakeText")
    /FIELD=(FAKENUM1, TYPE=WHOLE, POSITION=2, SIZE=2, SEPARATOR="\t", JDEF="FakeNum.A")
    /FIELD=(FAKENUM2, TYPE=WHOLE, POSITION=3, SIZE=4, SEPARATOR="\t", JDEF="FakeNum.B")
```
