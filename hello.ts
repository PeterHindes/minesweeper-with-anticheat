async function fetchreplace(url:string,find:string,replace:string) {
    let f = await fetch(url)
    let b = await f.text();
    let n = b.replaceAll(find,replace)
    return new Response(n, {
        status: 200,
        headers: {
          "content-type": "text/html",
        },
      }
    );
}

Deno.serve((_request: Request) => {
    // const site = await fetch("https://www.deno.com");
    // console.log(await site.text());
    return fetchreplace("https://www.deno.com","deno","dumbo");
});
  

export {}