from bs4 import BeautifulSoup
import os, re

def get_latest_version(dir):
    # Regular expression to match version folders
    version_pattern = re.compile(r'^(\d+)\.(\d+)\.(\d+)\.(\d+)$')   
    latest_version = None  
    # Iterate through all folders in the directory
    for folder in os.listdir(dir):
        match = version_pattern.match(folder)
        if match:
            first, second, third, fourth = map(int, match.groups())
            version = (first, second, third, fourth)   
            if latest_version is None or version > latest_version:
                latest_version = version  
    # Format the latest version as a string
    if latest_version:
        return f"{latest_version[0]}.{latest_version[1]}.{latest_version[2]}.{latest_version[3]}"
    else:
        return None

def extract_version_from_href(href,n):
#Extract version from the href path.
    end = href.find('/',n)
    match = href[n:end]
    if match:
        return match
    return None

def find_index(s):
    match = re.search(r'\d', s)
    if match:
        return match.start()
    return -1

def get_all_versions(path):
    #Extract all versions from a given .html file.
 with open(path, 'r', encoding='utf-8') as file:
    page = BeautifulSoup(file, 'lxml')
    # Find all unique versions from the given file
    links = page.select("div.version_select > ul.components > li.component > ul.versions > li.version > a")
    versions = set()
    for link in links:
        version = link.string
        if version:
            versions.add(version)
    
    return versions


def update_versions_file(file_path, all_versions):
    #Add missing versions to the given .html file.
    with open(file_path, 'r', encoding='UTF-8') as file:
        page = BeautifulSoup(file, 'lxml')

    # Find existing versions in the current file
    existing_versions = set()
    links = page.select("div.doc_select.version_select > ul.components > li.component > ul.versions > li.version > a")
    for link in links:
        version = link.string
        if version:
            existing_versions.add(version)

    # Find an example <li> to clone
    temp_link = page.select_one("div.doc_select.version_select > ul.components > li.component > ul.versions > li.version")
    if temp_link:
        temp_html = str(temp_link) 
        # Add missing versions
        versions_to_add = all_versions - existing_versions
        if versions_to_add:
            ul_versions = page.select_one("div.doc_select.version_select > ul.components > li.component > ul.versions")
            if ul_versions:
                for version in versions_to_add:
                    # Parse the example <li> to modify it
                    new_li = BeautifulSoup(temp_html, 'lxml').find('li')
                    new_a = new_li.find('a')
                    temp_href = new_a['href']
                    new_href_path=temp_href.split('/')
                    if(len(new_href_path)==1):
                        new_href= "../"+version+"/"+temp_href
                        new_a['href'] = new_href
                    else:
                        x=find_index(temp_href)
                        y = temp_href.find('/',x)
                        before = temp_href[:x]
                        after = temp_href[y:]  
                        # Concatenate parts with the new substring
                        new_href = before + version + after
                        new_a['href'] = new_href
                    new_a.string = version
                    new_li_classes = new_li.get('class', [])
                    if 'is-current' in new_li_classes:
                        new_li_classes.remove('is-current')
                        new_li['class'] = new_li_classes
                    og_label = new_a['aria-label'].split()
                    og_label[1]= version
                    new_label = ' '.join(og_label)
                    new_a['aria-label']=new_label
                    temp_link.insert_before(new_li)
    with open(file_path, 'w', encoding='UTF-8') as file:
        file.write(str(page))





langs = ["ja","zh-Hans"]
latest = get_latest_version("target/jekyll-webapp/ja/docs")
print("lates version is "+str(latest))
for lang in langs:
    for root, dirs, files in os.walk("target/jekyll-webapp/"+lang+"/docs", topdown=True):
        for f in files:
            if f.endswith('.html') and f != "index.html":
                with open(os.path.join(root, f)) as file:
                    page = BeautifulSoup(file, "lxml")
                    links = page.select("div.doc_select.version_select > ul.components > li.component > ul.versions > li.version > a")
                    for l in links:
                        href = l.get('href')
                        if href:
                            paths = href.split('/')
                            if len(paths) == 1:
                                link_path = root+ "/"+href
                            else:
                                n = find_index(href)
                                link_path = "target/jekyll-webapp/"+lang+"/docs/"+href[n:]
                            if not os.path.exists(link_path):
                                l.parent.decompose()
                with open(os.path.join(root, f), "w") as file1:
                        file1.write(str(page))


all_versions = get_all_versions("target/jekyll-webapp/ja/docs/"+str(latest)+"/overview.html")
for lang in langs:
    for root, dirs, files in os.walk("target/jekyll-webapp/"+lang+"/docs", topdown=True):
        for f in files:
            if f.endswith('.html') and f != "index.html":
                update_versions_file(os.path.join(root,f), all_versions)


 
