let idEdit = null;
var params = {
    display: 3,
    page: 1
}

const readData = () => {
    fetch(`http://localhost:3002/users?`).then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    }).then((response) => {
        console.log(response.data)
        params = { ...params, totalPages: response.totalPages }
        console.log('dalam', params)
        let html = ''
        let offset = (parseInt(params.page) - 1) * params.display
        response.data.forEach((item, index) => {
            html += `
            <tr>
              <td>${index + 1}</td>
              <td>${item.string}</td>
              <td>${item.integer}</td>
              <td>${item.float}</td>
              <td>${item.date}</td>
              <td>${item.boolean}</td>
              <td  class="text-center">
                <button type="button" class="btn btn-success" onclick='editData(${JSON.stringify(item)})'><i
                                        class="fa-solid fa-pencil"></i></button>
                <button type="button" class="btn btn-danger" onclick="removeData('${item._id}')"><i
                                        class="fa-solid fa-trash"></i></button>
              </td>
            </tr>
            `
        })
        console.log(html)
        document.getElementById('body-users').innerHTML = html
        pagination();
    })
}

const saveData = (e) => {
    e.preventDefault()
    const string = document.getElementById('string').value
    const integer = document.getElementById('integer').value
    const float = document.getElementById('float').value
    const date = document.getElementById('date').value
    const boolean = document.getElementById('boolean').value
    console.log(string, integer, float, date, boolean)

    if (idEdit == null) {
        fetch('http://localhost:3002/users/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ string, integer, float, date, boolean })
        }).then((response) => response.json()).then((data) => {
            readData()
        })
    } else {
        fetch(`http://localhost:3002/users/edit/${idEdit}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ string, integer, float, date, boolean })
        }).then((response) => response.json()).then((data) => {
            readData()
        })
        idEdit = null;
    }

    document.getElementById('string').value = ''
    document.getElementById('integer').value = ''
    document.getElementById('float').value = ''
    document.getElementById('date').value = ''
    document.getElementById('boolean').value = ''
    return false
}

const removeData = (id) => {
    fetch(`http://localhost:3002/users/delete/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((response) => response.json()).then((data) => {
        readData()
    })
}

const editData = (user) => {
    idEdit = user._id
    document.getElementById('string').value = user.string
    document.getElementById('integer').value = user.integer
    document.getElementById('float').value = user.float
    document.getElementById('date').val(moment(user.date).format('YYYY-MM-DD'))
    document.getElementById('boolean').value = user.boolean
}

const pagination = () => {
    let pagination = `<ul class="pagination">
                               <li class="page-item${params.page == 1 ? ' disabled' : ''}">
                                 <a class="page-link" id="halaman" href="javascript:void(0)" onclick="changePage(${parseInt(params.page) - 1})" aria-label="Previous">
                                  <span aria-hidden="true">&laquo;</span>
                                 </a>
                             </li>`
    for (let i = 1; i <= params.totalPages; i++) {
        pagination += `
        <li class="page-item${i == params.page ? ' active' : ''}"><a class="page-link" id="halaman" href="javascript:void(0)" id="angka" onclick="changePage(${i})">${i}</a></li>`
    }
    pagination += `<li class="page-item${params.page == params.totalPages ? ' disabled' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="changePage(${parseInt(params.page) + 1})" id="halaman" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    </ul>`
    document.getElementById('pagination').innerHTML = pagination
}

function changePage(page) {
    params = { ...params, page }
    console.log(params)
    readData()
    return false
}

// document.getElementById('form-search').addEventListener('submit', function (event) {
//     event.preventDefault()
//     const page = 1
//     const string = document.getElementById('searchString').value
//     const integer = document.getElementById('searchInteger').value
//     const float = document.getElementById('searchFloat').value
//     const startDate = document.getElementById('searchStartDate').value
//     const endDate = document.getElementById('searchEndDate').value
//     const boolean = document.getElementById('searchBoolean').value
//     params = { ...params, string, integer, float, startDate, endDate, boolean, page }
//     // let link = new URLSearchParams(params).toString()
//     readData()
// })

document.addEventListener('click', function (e) {
    try {
        // allows for elements inside TH
        function findElementRecursive(element, tag) {
            return element.nodeName === tag ? element : findElementRecursive(element.parentNode, tag)
        }

        var down_class = ' dir-d '
        var up_class = ' dir-u '
        var regex_dir = / dir-(u|d) /
        var regex_table = /\bsortable\b/
        var alt_sort = e.shiftKey || e.altKey
        var element = findElementRecursive(e.target, 'TH')
        var tr = findElementRecursive(element, 'TR')
        var table = findElementRecursive(tr, 'TABLE')

        function reClassify(element, dir) {
            element.className = element.className.replace(regex_dir, '') + dir
        }

        function getValue(element) {
            // If you aren't using data-sort and want to make it just the tiniest bit smaller/faster
            // comment this line and uncomment the next one
            return (
                (alt_sort && element.getAttribute('data-sort-alt')) || element.getAttribute('data-sort') || element.innerText
            )
            // return element.innerText
        }
        if (regex_table.test(table.className)) {
            var column_index
            var nodes = tr.cells

            // reset thead cells and get column index
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i] === element) {
                    column_index = element.getAttribute('data-sort-col') || i
                } else {
                    reClassify(nodes[i], '')
                }
            }

            var dir = down_class

            // check if we're sorting up or down, and update the css accordingly
            if (element.className.indexOf(down_class) !== -1) {
                dir = up_class
            }

            reClassify(element, dir)

            // extract all table rows, so the sorting can start.
            var org_tbody = table.tBodies[0]

            // get the array rows in an array, so we can sort them...
            var rows = [].slice.call(org_tbody.rows, 0)

            var reverse = dir === up_class

            // sort them using custom built in array sort.
            rows.sort(function (a, b) {
                var x = getValue((reverse ? a : b).cells[column_index])
                var y = getValue((reverse ? b : a).cells[column_index])
                return isNaN(x - y) ? x.localeCompare(y) : x - y
            })

            // Make a clone without content
            var clone_tbody = org_tbody.cloneNode()

            // Build a sorted table body and replace the old one.
            while (rows.length) {
                clone_tbody.appendChild(rows.splice(0, 1)[0])
            }

            // And finally insert the end result
            table.replaceChild(clone_tbody, org_tbody)
        }
    } catch (error) {
        // console.log(error)
    }
})

readData()