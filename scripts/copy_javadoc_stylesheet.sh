modifyStylesheet () {
    # Append extra javadoc styling located in the css direcctory to the stylesheet.css located in the javadoc subdirectories
    cat src/main/content/_assets/css/javadoc_extended_stylesheet.css >> "$1"

    # insert extra import to the beginning of the file
    sed '1 i\
    @import url("https://fonts.googleapis.com/css?family=Asap:300,400,500");
    ' "$1" > newstylesheet.css
    
    mv newstylesheet.css "$1"
}

export -f modifyStylesheet

find src/main/content/javadocs -name stylesheet.css -exec bash -c 'modifyStylesheet {}' \;