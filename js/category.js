(function() {
    function getTarget() {
        var thisName = document.getElementById('thisName').value;
        return thisName;
    }

    /*
     * category 타입의 문서 내부에 하위 문서 목록을 만들어 줍니다.
     */
    const target = getTarget();

    fetch(`/data/metadata/${target}.json`)
        .then(response => response.json())
        .then(function(data) {
            if (data == null) {
                return;
            }

            const children = data.children;

            var html = '';
            for (var i = 0; i < children.length; i++) {
                html += `<li id="child-document-${i}" class="post-item"></li>`
            }

            const containerTarget = document.getElementById('sub-document-list');

            if (containerTarget) {
                containerTarget.innerHTML = `<ul class="post-list">${html}</ul>`
            } else {
                document.getElementById('document-list').innerHTML = `<ul class="post-list">${html}</ul>`
            }

            if (data.children && data.children.length > 0) {
                // 자식 문서들의 메타데이터를 먼저 가져와서 updated 날짜로 정렬
                sortChildrenByUpdated(data.children).then(sortedChildren => {
                    insertChildren(sortedChildren);
                });
            }
            return;
        })
        .catch(function(error) {
            console.error(error);
        });

    /**
     * 자식 문서들의 메타데이터를 가져와서 updated 날짜 기준으로 내림차순 정렬합니다.
     */
    async function sortChildrenByUpdated(children) {
        const childrenWithMetadata = await Promise.all(
            children.map(async (child) => {
                try {
                    const response = await fetch(`/data/metadata/${child}.json`);
                    const data = await response.json();
                    return {
                        name: child,
                        updated: data.updated
                    };
                } catch (error) {
                    console.error(`Error fetching metadata for ${child}:`, error);
                    return {
                        name: child,
                        updated: '0000-00-00' // 에러 시 가장 뒤로 정렬
                    };
                }
            })
        );

        // updated 날짜 기준 내림차순 정렬
        childrenWithMetadata.sort((a, b) => {
            return b.updated.localeCompare(a.updated);
        });

        // 정렬된 문서 이름만 반환
        return childrenWithMetadata.map(item => item.name);
    }

    /**
     * 자식 문서들의 목록을 받아, 자식 문서 하나 하나의 링크를 만들어 삽입합니다.
     */
    function insertChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const target = children[i];

            fetch(`/data/metadata/${target}.json`)
                .then(response => response.json())
                .then(function(data) {
                    if (data == null) {
                        return;
                    }

                    const updated = data.updated.replace(/^(\d{4}-\d{2}-\d{2}).*/, '$1');
                    const title = `<span>${data.title}</span>`
                    const date = `<div class="post-meta" style="float: right;">${updated}</div>`;
                    const summary = (data.summary) ? `<div class="post-excerpt"> - ${data.summary}</div>` : '';

                    // 서브 문서들의 정보
                    const subDoc = (data.children && data.children.length > 0) ? `<div class="post-sub-document"> - 서브 문서: ${data.children.length} 개</div>` : '';

                    const html = `<a href="${data.url}" class="post-link">${title}${date}${summary}${subDoc}</a>`;
                    document.getElementById(`child-document-${i}`).innerHTML = html;

                    return;
                })
                .catch(function(error) {
                    console.error(error);
                });

        }
    }
})();