// 1. Scene, Camera & Renderer Setup
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(3, 3, 4);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Controls
const controls = new THREE.OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 2. Galaxy Configuration Parameters
const parameters = {
    count: 120000,          // তারকার সংখ্যা বাড়িয়ে আরও ডেন্স করা হয়েছে
    size: 0.012,
    radius: 6,
    branches: 4,
    spin: 1,
    randomness: 0.5,
    power: 3,
    insideColor: '#ff6030',
    outsideColor: '#1b3984'
};

let geometry = null;
let material = null;
let points = null;

// 3. Galaxy Generator Function
const generateGalaxy = () => {
    // Dispose old galaxy for performance optimization
    if (points !== null) {
        geometry.dispose();
        material.dispose();
        scene.remove(points);
    }

    geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);

    const colorInside = new THREE.Color(parameters.insideColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);

    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;

        // Position Calculations
        const radius = Math.random() * parameters.radius;
        const spinAngle = radius * parameters.spin;
        const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

        const randomX = Math.pow(Math.random(), parameters.power) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
        const randomY = Math.pow(Math.random(), parameters.power) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
        const randomZ = Math.pow(Math.random(), parameters.power) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;

        positions[i3]     = Math.cos(branchAngle + spinAngle) * radius + randomX;
        positions[i3 + 1] = randomY;
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

        // Color Blending
        const mixedColor = colorInside.clone();
        mixedColor.lerp(colorOutside, radius / parameters.radius);

        colors[i3]     = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Material
    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    });

    points = new THREE.Points(geometry, material);
    scene.add(points);
};

generateGalaxy();

// 4. Color Theme Switcher Function
window.changeTheme = (theme) => {
    // Update active button state
    document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (theme === 'fire') {
        parameters.insideColor = '#ff6030';
        parameters.outsideColor = '#1b3984';
        parameters.branches = 4;
    } else if (theme === 'neon') {
        parameters.insideColor = '#00ffcc';
        parameters.outsideColor = '#ff00ff';
        parameters.branches = 3;
    } else if (theme === 'cosmic') {
        parameters.insideColor = '#ffffff';
        parameters.outsideColor = '#6a00ff';
        parameters.branches = 5;
    }
    generateGalaxy();
};

// 5. Mouse Parallax Effect
const mouse = { x: 0, y: 0 };
window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX / sizes.width - 0.5;
    mouse.y = event.clientY / sizes.height - 0.5;
});

// 6. Responsive Resize Handler
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// 7. Animation Loop
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Rotate Galaxy slowly
    if (points) {
        points.rotation.y = elapsedTime * 0.08;
    }

    // Parallax motion based on mouse movement
    camera.position.x += (mouse.x * 0.5 - camera.position.x * 0.1) * 0.05;
    camera.position.y += (-mouse.y * 0.5 - camera.position.y * 0.1) * 0.05;

    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();
