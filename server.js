import express from "express";
import cors from "cors";
import { getJson } from "serpapi";
import { Parser } from "json2csv";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Api key for SERP (google search) api
const SERP_API_KEY = "4010afea5e43435570ec6cb9143f763d597fcb12aeb3daa5bbd425d55a6e2fed";

// Initiate SERP function
async function fetchSerp(keyword) {
    const res = await getJson({
        engine: "google",
        q: keyword,
        api_key: SERP_API_KEY
    }) 

    const data = res.organic_results || [];

    return data.map((item, index) => ({
        keyword,
        title: item.title,
        url: item.link,
        position: index + 1,
        date: new Date().toISOString().split("T")[0],
    }));
}

// Api interactions
app.post("/api/serp", async (req, res) => {
    const keywords = req.body.keywords;

    if(!keywords || keywords.length === 0) {
        return res.status(400).json({error: "Keyword cannot be empty"});
    }

    let searchResults = [];

    for (const keyword of keywords) {
        const results = await fetchSerp(keyword);
        searchResults = searchResults.concat(results);
    }

    // Generate CSV
    const dataParser = new Parser();
    const csv = dataParser.parse(searchResults);
    const fileName = `search-result-${Date.now()}.csv`;
    
    fs.writeFileSync(`public/${fileName}`, csv);

    res.json({
        result: searchResults,
        csvFile: fileName
    });
});

app.listen(3004, () => {
    // Logging if node running
    console.log('app running successfully')
})



