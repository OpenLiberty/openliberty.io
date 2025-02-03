from bs4 import BeautifulSoup
import os, re

def find_index(s):
    match = re.search(r'\d', s)
    if match:
        return match.start()
    # else:
    #      return s.find("\\latest")
    return -1

for root, dirs, files in os.walk("target/jekyll-webapp/docs", topdown=True):
    for f in files:
        if f.endswith('.html') and f != "index.html":
            with open(os.path.join(root, f)) as file:
                page = BeautifulSoup(file, "lxml")
                links = page.select("div.doc_select.language_select > ul.components > li.component > ul.versions > li.version > a")
                for l in links:
                    href = l.get('href')
                    if "zh-Hans" in href or "ja" in href:
                        paths = href.split('/')
                        if len(paths) == 1:
                               link_path = root+ "/"+href
                        else:
                            n = find_index(href)
                            if "zh-Hans" in href:
                                link_path = "target/jekyll-webapp/zh-Hans/docs/"+href[n:]
                            else:
                                link_path = "target/jekyll-webapp/ja/docs/"+href[n:]     
                        print(link_path)                          
                        if not os.path.exists(link_path):
                            l.parent.decompose()
            with open(os.path.join(root, f), "w") as file1:
                     file1.write(str(page))

