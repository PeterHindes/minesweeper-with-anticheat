export {}
const port = 5000;

import { handlePlayer } from "./public/gamefuncs.js";

import { serve } from "https://deno.land/std@0.116.0/http/server.ts";
import staticFiles from "https://deno.land/x/static_files@1.1.6/mod.ts";

const serveFiles = (req: Request) => staticFiles('public')({ 
    request: req, 
    respondWith: (r: Response) => r 
})

// map the /api/ route to the fetch event
serve((req: Request) => {
    console.log(req.url);
    
    // url contains */api/*
    if(req.url.includes("/api/")){
        console.log("API Request");
        return new Response(handlePlayer(req.url), {
            status: 200,
            headers: {
               'Content-Type': 'text/html'
            }
         });
    }
    return serveFiles(req);
}, { addr: ':'+port });


console.log("Live on port "+port+" at http://localhost:"+port);

// serve((req) => serveFiles(req), { addr: ':'+port });