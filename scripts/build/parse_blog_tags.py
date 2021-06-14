import json
import os

f = open("src/main/content/blog_tags.json", "r")
content = json.loads(f.read())
tags = content['blog_tags']
for tag in tags:
    tag_name = tag['name']
    posts = tag['posts']
    for post_name in posts:
        for file_name in os.listdir("src/main/content/_posts/"):            
            if os.path.isfile("src/main/content/_posts/" + file_name) and file_name.endswith(post_name + '.adoc'):
                f_post = open("src/main/content/_posts/" + file_name)
                data = f_post.readlines()
                
                # Check if there is already a tags front-matter from a previous tag
                line_num = 0
                tags_line = -1
                for line in data:
                    if line.startswith('tags: '):
                        tags_line = line_num
                        break
                    line_num += 1
                if tags_line != -1:
                    data[tags_line] = data[tags_line].replace(']', '').rstrip('\n') # Remove end bracket and initial newline
                    data[tags_line] = data[tags_line] + ', "' + tag_name + '"]\n'
                else:
                    # Otherwise, add the tags after the first line of front-matter
                    data[2] = 'tags: ["' + tag_name + '"]\n' + data[2] 

                with open("src/main/content/_posts/" + file_name, 'w') as f_write:
                    f_write.writelines(data)
                    f_write.close()
f.close()