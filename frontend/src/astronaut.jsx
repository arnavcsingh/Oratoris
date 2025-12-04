import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

export default function Astronaut(props) {
    const group = useRef();
    const { scene } = useGLTF("/astronaut.glb");
    console.log("Astronaut scene:", scene);

    scene.rotation.set(0, Math.PI, 0);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (group.current) {
        group.current.position.y = Math.sin(t) * 0.1;
        group.current.rotation.y += 0.003;
        }
    });

    return (
    <group ref={group} {...props} scale={1.8} position={[0, -2.0, 0]}>
        <primitive object={scene} />
    </group>
    );
    }

useGLTF.preload("/astronaut.glb");