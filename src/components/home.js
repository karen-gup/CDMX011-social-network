/* eslint-disable no-unused-expressions */
import { onNavigate } from '../main.js';
import { allFunctions } from '../lib/validFunc.js';
import {
  logOut, getUser, postInFirestore, updatePost, deletePost,
  getPost, editPost, unLikePost, likePost,
} from '../firebaseAuth.js';

export const home = () => {
  let userEmail = getUser();
  userEmail !== null ? userEmail = userEmail.email : userEmail = '';
  const homePage = document.createElement('div');
  homePage.setAttribute('id', 'homePage');
  const htmlNodes = `<header id = "wallBanner" >
  <img id="logoWall" src="./imagenes/Imagen1.png">
  <h1 id="petFriendsWall">Pet Friends</h1>
  <img id="signOut" src= "./imagenes/exit.png"></header>
  <h2 id= "welcomeMessage">Bienvenid@ ${userEmail}</h2>
  <p id= "catchPost"></p>
  <div id="postContainer">
  <img id= "yellowDog" src="./imagenes/Güero.png">
  <button id="postInput">Cuéntanos sobre tu petFriend</button>
  </div>   
  <div id="backModal">
  <div id="modal">
  <h3 id="close">x</h3>
  <textarea id="post" placeholder = "Cuéntanos sobre tu petFriend"></textarea>
  <input type="file" id="addImg" name="addImg" accept="image/png, image/jpeg, image/jpg">
  <button id="share" class="send" >Publicar</button>
  </div>
  </div>
  <div id="posts"></div>
  `;
  homePage.innerHTML = htmlNodes;
  const modal = homePage.querySelector('#backModal');
  const postDivPublish = homePage.querySelector('#posts');

  // Botón de cerrar sesión
  homePage.querySelector('#signOut').addEventListener('click', () => logOut(onNavigate));

  // Botón para abrir el modal
  homePage.querySelector('#postInput').addEventListener('click', () => {
    modal.style.visibility = 'visible';
    homePage.querySelector('#post').value = '';
  });

  // Es la x para cerrar el modal
  homePage.querySelector('#close').addEventListener('click', () => {
    modal.style.visibility = 'hidden';
  });

  // Botón para publicar el post
  homePage.querySelector('#share').addEventListener('click', () => {
    modal.style.visibility = 'hidden';
    //  sección de comentario
    const postPublish = homePage.querySelector('#post').value;
    const date = new Date();
    const postDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} a las ${date.getHours()}:${date.getMinutes()}`;
    const likeUser = [];
    allFunctions.validPost(postPublish) === false ? alert('No has publicado un post aún') : postInFirestore(postPublish, userEmail, postDate, likeUser);
    // Sección de imagen
    // const imgPost = homePage.querySelector('#addImg').files[0];
    // storageRef(imgPost, imgPost.name);
    // storageDown(imgPost);
    // console.log(imgPost);
  });

  // Imprime los post en pantalla
  updatePost((snapshot) => {
    postDivPublish.innerHTML = '';
    snapshot.forEach((doc) => {
      const comentId = doc.id;
      const htmlPostsPublished = `<div id= "recentPostDiv" class= "completePost">
          <p id="userMail" class="userMail" >${doc.data().user}:</p>
          <p id="date">${doc.data().date}</p>
          <p id="recentPost">${doc.data().post}</p>
          ${userEmail === doc.data().user
    ? `<div id= "divButtons">
          <img id="img" data-id= ${comentId} class= "like" ${doc.data().like.includes(userEmail) ? 'src= "./imagenes/patitaColor.png"' : 'src= "./imagenes/patitaGris.png"'}>
          <p id="paragCounter" class="paragCounter">${doc.data().like.length}</p>
          <button id= "edit" class= "btnEdit" data-id= ${comentId} >Editar</button>
            <div class="editBackModal">
               <div class="editModal">
                  <h3 class="editClose">x</h3>
                  <textarea class="editPost"></textarea>
                  <button id="share" class="save">Guardar</button>
               </div>
            </div>
          <button id= "deletes" class="btndeletes" data-id= ${comentId}>Borrar</button> 
          <div class="deleteBackModal">
            <div class="deleteModal" >
              <h2 class= "confirmText">¿Estás segur@ que deseas eliminar este post? </h2>
              <button class="si">Si</button>
              <button class="no" >No</button>
             </div>
          </div>`
    : `<div id= "divButtons">
    <img id="img" data-id= ${comentId} class= "like" ${doc.data().like.includes(userEmail) ? 'src= "./imagenes/patitaColor.png"' : 'src= "./imagenes/patitaGris.png"'}>
    <p id="paragCounter" class="paragCounter">${doc.data().like.length}<p>`}
            </div>
          </div>`;

      postDivPublish.innerHTML += htmlPostsPublished;

      // Función para manipular el like
      const colorPaw = postDivPublish.querySelectorAll('.like');
      colorPaw.forEach((postLike) => {
        postLike.addEventListener('click', async (e) => {
          const likeId = await getPost(e.target.dataset.id);
          const arrayLike = likeId.data().like;
          const idPost = e.target.dataset.id;
          !arrayLike.includes(userEmail) ? likePost(idPost, userEmail)
            : unLikePost(idPost, userEmail);
        });
      });
      // Botón para eliminar post
      const deletebtn = postDivPublish.querySelectorAll('.btndeletes');
      const deleteModal = postDivPublish.querySelector('.deleteBackModal');
      deletebtn.forEach((btnDelete) => {
        btnDelete.addEventListener('click', (f) => {
          deleteModal.style.visibility = 'visible';
          const confirmDelete = () => deletePost(f.target.dataset.id);
          deleteModal.addEventListener('click', (e) => {
            if (e.target.classList.contains('si')) {
              confirmDelete();
              deleteModal.style.visibility = 'hidden';
            } else {
              deleteModal.style.visibility = 'hidden';
            }
          });
        });
      });

      // Botón para editar el post
      const btnEdit = postDivPublish.querySelectorAll('.btnEdit');
      const postEditModal = postDivPublish.querySelector('.editBackModal');
      const editedPost = postDivPublish.querySelector('.editPost');
      btnEdit.forEach((edtPost) => {
        edtPost.addEventListener('click', async (event) => {
          postEditModal.style.visibility = 'visible';
          const editId = await getPost(event.target.dataset.id);
          editedPost.value = editId.data().post;
          postEditModal.addEventListener('click', (e) => {
            if (e.target.classList.contains('save')) {
              editPost(editId.id, editedPost.value);
              postEditModal.style.visibility = 'hidden';
            }
            if (e.target.classList.contains('editClose')) {
              postEditModal.style.visibility = 'hidden';
            }
          });
        });
      });
    });
  });

  return homePage;
};
