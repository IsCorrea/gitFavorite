import { GithubUser } from "./GithubUser.js"

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.loadUsers()
  }

  loadUsers() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  async add(username) {
    try {
      const userExists = this.entries.find(entry => entry.login === username)

      if(userExists) {
        throw new Error(`User ${username} already exists`)
      }

      const user = await GithubUser.search(username)

      if (user.login === undefined) {
        throw new Error('User not found')
      }

      this.entries = [user, ...this.entries]
      
      this.updateUser()
      this.save()

    } catch (error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(entry => 
      entry.login !== user.login)

    this.entries = filteredEntries

    this.updateUser()
    this.save()
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')
    this.updateUser()
    this.onAdd()
  }
  
  onAdd() {
    const addButton = this.root.querySelector('#search button')

    addButton.onclick = () => {
      const {value} = this.root.querySelector('#search input')

      this.add(value)
    }
  }

  updateUser() {
    this.removeRow()

    this.entries.forEach(user => {
      const row = this.createRow()

      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Profile picture of ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user #name').textContent = user.name
      row.querySelector('.user #login').textContent = user.login
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('.remove').onclick = () => {
        const confirmDelete = confirm(`Delete ${user.name}`)
        if (confirmDelete) {
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })
  }

  createRow() {
    const tr = document.createElement('tr')
    
    tr.innerHTML = `
    <td class="user">
      <img src="https://github.com/iscorrea.png" alt="">
      <a href="https://github.com/iscorrea" target="_blank">
        <p id="name">Isabella Corrêa</p>
        <p id="login">/iscorrea</p>
      </a>
    </td>
    <td class="repositories">123</td>
    <td class="followers">1234</td>
    <td><button class="remove">Remover</button></td>
    `
    
    return tr
  }

  removeRow() {
    this.tbody.querySelectorAll('tr')
    .forEach((tr) => {tr.remove()})
  }
}