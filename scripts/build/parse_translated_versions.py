from bs4 import BeautifulSoup
import os

# uses for this script:
#  - fix img links
#  - remove unknown versions from docs version picker

for root, dirs, files in os.walk("target/jekyll-webapp/ja/docs", topdown=True):
    for f in files:
        if f.endswith('.html') and f != "index.html":
            page = BeautifulSoup(open(os.path.join(root, f)), "lxml")
            links = page.select("li.version > a")
            for l in links:
                if not (os.path.exists(os.path.join(root, l['href']))):
                    l.parent.decompose();
            imgs = page.find_all("img")
            vers = (root+"/").split("/docs/")[1]
            if vers == None:
                print("Version for file not found, skipping...")
                continue
            if "/reference/" in vers:
                continue
            for img in imgs:
                if "/_/" in img['src']:
                    continue
                if img['src'].startswith("/"):
                    orig = (img['src'])[1:]
                else:
                    orig = img['src']
                newSrc = "../../../docs/" + vers + img['src']
                img['src'] = newSrc
            with open(os.path.join(root, f), "w") as file:
                file.write(str(page))