modifyStylesheet () {
    # Append extra javadoc styling located in the css direcctory to the stylesheet.css located in the javadoc subdirectories
    cat src/main/content/_assets/css/javadoc-extended-stylesheet.css >> "$1"

    # insert extra import to the beginning of the file
    sed '1 i\
    @import url("https://fonts.googleapis.com/css?family=Asap:300,400,500");
    ' "$1" > newstylesheet.css
    
    mv newstylesheet.css "$1"
}

modifySearch () {
    # add url support to search
    cp src/main/content/_assets/js/javadoc-search.js "$1"
}

export -f modifyStylesheet
export -f modifySearch

find src/main/content/docs/ref/javadocs -name stylesheet.css -exec bash -c 'modifyStylesheet {}' \;
find src/main/content/docs/ref/javadocs -name search.js  -exec bash -c 'modifySearch {}' \;
