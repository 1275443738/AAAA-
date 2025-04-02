// 网站数据存储
let users = JSON.parse(localStorage.getItem('users')) || [];
let posts = JSON.parse(localStorage.getItem('posts')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let likes = JSON.parse(localStorage.getItem('likes')) || [];

// DOM 加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化事件监听
    initEventListeners();
    
    // 检查登录状态
    checkLoginStatus();
    
    // 加载动态
    loadPosts();
    
    // 加载推荐用户
    loadSuggestedUsers();
});

// 初始化事件监听
function initEventListeners() {
    // 登录和注册模态框
    document.getElementById('loginToggle').addEventListener('click', openLoginModal);
    document.getElementById('registerToggle').addEventListener('click', openRegisterModal);
    document.getElementById('logoutToggle').addEventListener('click', logout);
    document.getElementById('closeLoginModal').addEventListener('click', closeLoginModal);
    document.getElementById('closeRegisterModal').addEventListener('click', closeRegisterModal);
    document.getElementById('switchToRegister').addEventListener('click', switchToRegister);
    document.getElementById('switchToLogin').addEventListener('click', switchToLogin);
    
    // 登录表单提交
    document.getElementById('loginForm').addEventListener('submit', login);
    
    // 注册表单提交
    document.getElementById('registerForm').addEventListener('submit', register);
    
    // 发布动态
    document.getElementById('postButton').addEventListener('click', createPost);
    
    // 个人主页标签切换
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', function() {
            // 移除所有标签的active类
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            // 为当前标签添加active类
            this.classList.add('active');
            
            // 隐藏所有内容
            document.querySelectorAll('.profile-tab-content').forEach(content => content.classList.remove('active'));
            
            // 显示对应内容
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // 编辑资料按钮
    document.getElementById('editProfileBtn').addEventListener('click', editProfile);
}

// 检查登录状态
function checkLoginStatus() {
    if (currentUser) {
        // 显示注销按钮，隐藏登录和注册按钮
        document.getElementById('loginToggle').style.display = 'none';
        document.getElementById('registerToggle').style.display = 'none';
        document.getElementById('logoutToggle').style.display = 'block';
        
        // 更新个人资料显示
        document.getElementById('usernameDisplay').textContent = currentUser.username;
        document.getElementById('userBio').textContent = currentUser.bio || '欢迎来到长大留守儿童';
        document.getElementById('profileUsername').textContent = currentUser.username;
        document.getElementById('profileBio').textContent = currentUser.bio || '欢迎来到我的主页';
        
        // 加载用户动态
        loadUserPosts();
        loadLikedPosts();
    } else {
        // 显示登录和注册按钮，隐藏注销按钮
        document.getElementById('loginToggle').style.display = 'block';
        document.getElementById('registerToggle').style.display = 'block';
        document.getElementById('logoutToggle').style.display = 'none';
        
        // 更新个人资料显示
        document.getElementById('usernameDisplay').textContent = '未登录';
        document.getElementById('userBio').textContent = '欢迎来到长大留守儿童';
        document.getElementById('profileUsername').textContent = '未登录';
        document.getElementById('profileBio').textContent = '欢迎来到我的主页';
    }
}

// 打开登录模态框
function openLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

// 关闭登录模态框
function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

// 打开注册模态框
function openRegisterModal() {
    document.getElementById('registerModal').style.display = 'block';
}

// 关闭注册模态框
function closeRegisterModal() {
    document.getElementById('registerModal').style.display = 'none';
}

// 切换到注册表单
function switchToRegister() {
    closeLoginModal();
    openRegisterModal();
}

// 切换到登录表单
function switchToLogin() {
    closeRegisterModal();
    openLoginModal();
}

// 注销
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    checkLoginStatus();
    alert('已注销');
}

// 登录
function login(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        closeLoginModal();
        checkLoginStatus();
        alert('登录成功！');
    } else {
        alert('用户名或密码错误！');
    }
}

// 注册
function register(event) {
    event.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('两次输入的密码不一致！');
        return;
    }
    
    if (users.some(u => u.username === username)) {
        alert('用户名已存在！');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        username: username,
        email: email,
        password: password,
        bio: '',
        avatar: 'default-avatar.jpg'
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // 自动登录
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    closeRegisterModal();
    checkLoginStatus();
    alert('注册成功并已登录！');
}

// 创建新动态
function createPost() {
    if (!currentUser) {
        alert('请先登录！');
        return;
    }
    
    const content = document.getElementById('postContent').value.trim();
    if (!content) {
        alert('请输入动态内容！');
        return;
    }
    
    const newPost = {
        id: Date.now(),
        userId: currentUser.id,
        username: currentUser.username,
        content: content,
        imageUrl: '', // 可以扩展为支持图片上传
        date: new Date().toISOString(),
        likes: 0,
        comments: []
    };
    
    posts.unshift(newPost);
    localStorage.setItem('posts', JSON.stringify(posts));
    
    // 清空输入框
    document.getElementById('postContent').value = '';
    
    // 重新加载动态
    loadPosts();
    loadUserPosts();
}

// 加载动态
function loadPosts() {
    const postsContainer = document.getElementById('postsContainer');
    postsContainer.innerHTML = '';
    
    if (posts.length === 0) {
        postsContainer.innerHTML = '<p class="no-content">暂无动态</p>';
        return;
    }
    
    posts.forEach(post => {
        const postCard = document.createElement('div');
        postCard.className = 'post-card';
        
        let imageHtml = '';
        if (post.imageUrl) {
            imageHtml = `<img src="${post.imageUrl}" alt="动态图片" class="post-image">`;
        }
        
        let liked = likes.some(like => like.postId === post.id && like.userId === currentUser?.id);
        
        postCard.innerHTML = `
            <div class="post-header">
                <img src="profile.jpg" alt="${post.username}" class="post-avatar">
                <div class="post-user-info">
                    <h4>${post.username}</h4>
                    <p>${formatDate(new Date(post.date))}</p>
                </div>
            </div>
            <div class="post-content">
                <p>${post.content}</p>
                ${imageHtml}
            </div>
            <div class="post-actions-bar">
                <div class="post-action ${liked ? 'liked' : ''}" data-post-id="${post.id}">
                    <i class="far fa-heart"></i> <span>${post.likes}</span>
                </div>
                <div class="post-action" data-post-id="${post.id}">
                    <i class="far fa-comment"></i> <span>${post.comments.length}</span>
                </div>
                <div class="post-action">
                    <i class="far fa-retweet"></i>
                </div>
            </div>
            <div class="post-comments" id="comments-${post.id}">
                <!-- 评论将通过JavaScript动态加载 -->
            </div>
        `;
        
        postsContainer.appendChild(postCard);
        
        // 添加点赞事件
        const likeButton = postCard.querySelector(`.post-action[data-post-id="${post.id}"]`);
        likeButton.addEventListener('click', function() {
            toggleLike(post.id);
        });
        
        // 添加评论事件
        const commentButton = postCard.querySelector(`.post-action[data-post-id="${post.id}"]:nth-child(2)`);
        commentButton.addEventListener('click', function() {
            toggleComments(post.id);
        });
    });
}

// 切换点赞
function toggleLike(postId) {
    if (!currentUser) {
        alert('请先登录！');
        return;
    }
    
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;
    
    const likeIndex = likes.findIndex(l => l.postId === postId && l.userId === currentUser.id);
    
    if (likeIndex === -1) {
        // 点赞
        likes.push({
            userId: currentUser.id,
            postId: postId
        });
        
        posts[postIndex].likes++;
    } else {
        // 取消点赞
        likes.splice(likeIndex, 1);
        
        posts[postIndex].likes--;
    }
    
    localStorage.setItem('likes', JSON.stringify(likes));
    localStorage.setItem('posts', JSON.stringify(posts));
    
    loadPosts();
    loadUserPosts();
    loadLikedPosts();
}

// 切换评论显示
function toggleComments(postId) {
    const commentsContainer = document.getElementById(`comments-${postId}`);
    
    if (commentsContainer.style.display === 'block') {
        commentsContainer.style.display = 'none';
        return;
    }
    
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    commentsContainer.style.display = 'block';
    
    // 清空现有评论
    commentsContainer.innerHTML = '';
    
    // 添加评论表单
    const commentForm = document.createElement('div');
    commentForm.className = 'comment-form';
    commentForm.innerHTML = `
        <textarea placeholder="发表评论..." id="commentContent-${postId}"></textarea>
        <button class="btn" onclick="addComment(${postId})">评论</button>
    `;
    commentsContainer.appendChild(commentForm);
    
    // 加载评论
    loadComments(postId);
}

// 添加评论
function addComment(postId) {
    if (!currentUser) {
        alert('请先登录！');
        return;
    }
    
    const commentContent = document.getElementById(`commentContent-${postId}`).value.trim();
    if (!commentContent) {
        alert('请输入评论内容！');
        return;
    }
    
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;
    
    const newComment = {
        id: Date.now(),
        userId: currentUser.id,
        username: currentUser.username,
        content: commentContent,
        date: new Date().toISOString()
    };
    
    posts[postIndex].comments.push(newComment);
    localStorage.setItem('posts', JSON.stringify(posts));
    
    // 清空评论输入框
    document.getElementById(`commentContent-${postId}`).value = '';
    
    // 重新加载评论
    loadComments(postId);
}

// 加载评论
function loadComments(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const commentsContainer = document.getElementById(`comments-${postId}`);
    
    // 清空现有评论
    const existingComments = commentsContainer.querySelector('.comments-list');
    if (existingComments) {
        existingComments.remove();
    }
    
    // 创建评论列表
    const commentsList = document.createElement('div');
    commentsList.className = 'comments-list';
    
    if (post.comments.length === 0) {
        commentsList.innerHTML = '<p class="no-comments">暂无评论</p>';
    } else {
        post.comments.forEach(comment => {
            const commentItem = document.createElement('div');
            commentItem.className = 'comment-item';
            commentItem.innerHTML = `
                <div class="comment-header">
                    <span class="comment-username">${comment.username}</span>
                    <span class="comment-date">${formatDate(new Date(comment.date))}</span>
                </div>
                <div class="comment-content">${comment.content}</div>
            `;
            commentsList.appendChild(commentItem);
        });
    }
    
    commentsContainer.appendChild(commentsList);
}

// 编辑个人资料
function editProfile() {
    if (!currentUser) {
        alert('请先登录！');
        return;
    }
    
    const newBio = prompt('请输入个人简介:', currentUser.bio || '');
    if (newBio === null) return;
    
    currentUser.bio = newBio;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    alert('个人资料已更新！');
    checkLoginStatus();
}

// 加载用户动态
function loadUserPosts() {
    if (!currentUser) return;
    
    const userPostsContainer = document.getElementById('userPostsContainer');
    userPostsContainer.innerHTML = '';
    
    const userPosts = posts.filter(post => post.userId === currentUser.id);
    
    if (userPosts.length === 0) {
        userPostsContainer.innerHTML = '<p class="no-content">暂无动态</p>';
        return;
    }
    
    userPosts.forEach(post => {
        const postCard = document.createElement('div');
        postCard.className = 'post-card';
        
        let imageHtml = '';
        if (post.imageUrl) {
            imageHtml = `<img src="${post.imageUrl}" alt="动态图片" class="post-image">`;
        }
        
        let liked = likes.some(like => like.postId === post.id && like.userId === currentUser.id);
        
        postCard.innerHTML = `
            <div class="post-header">
                <img src="profile.jpg" alt="${post.username}" class="post-avatar">
                <div class="post-user-info">
                    <h4>${post.username}</h4>
                    <p>${formatDate(new Date(post.date))}</p>
                </div>
            </div>
            <div class="post-content">
                <p>${post.content}</p>
                ${imageHtml}
            </div>
            <div class="post-actions-bar">
                <div class="post-action ${liked ? 'liked' : ''}" data-post-id="${post.id}">
                    <i class="far fa-heart"></i> <span>${post.likes}</span>
                </div>
                <div class="post-action" data-post-id="${post.id}">
                    <i class="far fa-comment"></i> <span>${post.comments.length}</span>
                </div>
                <div class="post-action">
                    <i class="far fa-retweet"></i>
                </div>
            </div>
            <div class="post-comments" id="comments-${post.id}">
                <!-- 评论将通过JavaScript动态加载 -->
            </div>
        `;
        
        userPostsContainer.appendChild(postCard);
        
        // 添加点赞事件
        const likeButton = postCard.querySelector(`.post-action[data-post-id="${post.id}"]`);
        likeButton.addEventListener('click', function() {
            toggleLike(post.id);
        });
        
        // 添加评论事件
        const commentButton = postCard.querySelector(`.post-action[data-post-id="${post.id}"]:nth-child(2)`);
        commentButton.addEventListener('click', function() {
            toggleComments(post.id);
        });
    });
}

// 加载点赞动态
function loadLikedPosts() {
    if (!currentUser) return;
    
    const likedPostsContainer = document.getElementById('likedPostsContainer');
    likedPostsContainer.innerHTML = '';
    
    const likedPostIds = likes.filter(like => like.userId === currentUser.id).map(like => like.postId);
    const likedPosts = posts.filter(post => likedPostIds.includes(post.id));
    
    if (likedPosts.length === 0) {
        likedPostsContainer.innerHTML = '<p class="no-content">暂无点赞动态</p>';
        return;
    }
    
    likedPosts.forEach(post => {
        const postCard = document.createElement('div');
        postCard.className = 'post-card';
        
        let imageHtml = '';
        if (post.imageUrl) {
            imageHtml = `<img src="${post.imageUrl}" alt="动态图片" class="post-image">`;
        }
        
        let liked = likes.some(like => like.postId === post.id && like.userId === currentUser.id);
        
        postCard.innerHTML = `
            <div class="post-header">
                <img src="profile.jpg" alt="${post.username}" class="post-avatar">
                <div class="post-user-info">
                    <h4>${post.username}</h4>
                    <p>${formatDate(new Date(post.date))}</p>
                </div>
            </div>
            <div class="post-content">
                <p>${post.content}</p>
                ${imageHtml}
            </div>
            <div class="post-actions-bar">
                <div class="post-action ${liked ? 'liked' : ''}" data-post-id="${post.id}">
                    <i class="far fa-heart"></i> <span>${post.likes}</span>
                </div>
                <div class="post-action" data-post-id="${post.id}">
                    <i class="far fa-comment"></i> <span>${post.comments.length}</span>
                </div>
                <div class="post-action">
                    <i class="far fa-retweet"></i>
                </div>
            </div>
            <div class="post-comments" id="comments-${post.id}">
                <!-- 评论将通过JavaScript动态加载 -->
            </div>
        `;
        
        likedPostsContainer.appendChild(postCard);
        
        // 添加点赞事件
        const likeButton = postCard.querySelector(`.post-action[data-post-id="${post.id}"]`);
        likeButton.addEventListener('click', function() {
            toggleLike(post.id);
        });
        
        // 添加评论事件
        const commentButton = postCard.querySelector(`.post-action[data-post-id="${post.id}"]:nth-child(2)`);
        commentButton.addEventListener('click', function() {
            toggleComments(post.id);
        });
    });
}

// 加载推荐用户
function loadSuggestedUsers() {
    const suggestedUsersContainer = document.getElementById('suggestedUsers');
    suggestedUsersContainer.innerHTML = '';
    
    // 过滤掉当前用户
    const suggestedUsers = users.filter(user => user.id !== currentUser?.id).slice(0, 5);
    
    if (suggestedUsers.length === 0) {
        suggestedUsersContainer.innerHTML = '<p class="no-content">暂无推荐用户</p>';
        return;
    }
    
    suggestedUsers.forEach(user => {
        const userItem = document.createElement('li');
        userItem.className = 'suggestion-item';
        userItem.innerHTML = `
            <img src="profile.jpg" alt="${user.username}" class="suggestion-avatar">
            <div class="suggestion-info">
                <div class="suggestion-name">${user.username}</div>
                <div class="suggestion-bio">${user.bio || '暂无简介'}</div>
            </div>
            <button class="follow-btn">关注</button>
        `;
        suggestedUsersContainer.appendChild(userItem);
    });
}

// 格式化日期
function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) {
        return '刚刚';
    } else if (diff < 3600000) {
        return Math.floor(diff / 60000) + '分钟前';
    } else if (diff < 86400000) {
        return Math.floor(diff / 3600000) + '小时前';
    } else {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }
}