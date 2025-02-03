from bs4 import BeautifulSoup
import os

langs = ["ja", "zh-Hans"]
for l in langs:
        for root, dirs, files in os.walk("target/jekyll-webapp/"+l+"/docs/latest", topdown=True):
            for f in files:
                if f.endswith('.html') and f != "index.html":
                    page = BeautifulSoup(open(os.path.join(root, f)), "lxml")
                    imgs = page.find_all("img")
                    vers = (root+"/").split("/docs/")[1]
                    if vers == None:
                        print("Version for file not found, skipping...")
                        continue
                    if "/reference/" in vers:
                        continue
                    for img in imgs:
                        s = str(img['src'])
                        if s.startswith("../../img/"):
                            img_path=s.split("/img/")[1]
                            img['src'] = "/img/"+img_path
                        else:
                            continue
                    with open(os.path.join(root, f), "w") as file1:
                        file1.write(str(page))


