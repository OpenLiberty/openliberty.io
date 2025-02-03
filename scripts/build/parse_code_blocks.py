from bs4 import BeautifulSoup
import os
        
for root, dirs, files in os.walk("target/jekyll-webapp/docs/latest"):
    for f in files:
        if f.endswith('.html'):
            page = BeautifulSoup(open(os.path.join(root, f)), "lxml")
            for el in page.find_all(['pre', 'code']):
                el['translate']='no'
            with open(os.path.join(root, f), "w") as file:
                file.write(str(page))
                