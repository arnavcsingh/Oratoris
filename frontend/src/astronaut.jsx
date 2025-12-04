import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

export default function Astronaut(props) {
    const group = useRef();
    const { scene } = useGLTF("/astronaut.glb");

    const bones = useRef({});
    const baseHeadRotation = useRef({ x: 0, y: 0, z: 0 });

    useEffect(() => {
        scene.traverse((obj) => {
            if (obj.isBone) bones.current[obj.name] = obj;
        });

        if (bones.current.Head_05) {
            baseHeadRotation.current = {
                x: bones.current.Head_05.rotation.x,
                y: bones.current.Head_05.rotation.y,
                z: bones.current.Head_05.rotation.z,
            };
        }

        if (bones.current.UpperArml_015) bones.current.UpperArml_015.rotation.z = 0.4;
        if (bones.current.UpperArmr_07) bones.current.UpperArmr_07.rotation.z = -0.4;

        if (bones.current.LowerArml_016) bones.current.LowerArml_016.rotation.z = 0.2;
        if (bones.current.LowerArmr_08) bones.current.LowerArmr_08.rotation.z = -0.2;

        if (bones.current.Chest_03) bones.current.Chest_03.rotation.x = -0.1;

    }, [scene]);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();

        group.current.position.y = Math.sin(t * 1) * 0.12 + 0.05;
        group.current.position.x = Math.sin(t * 0.5) * 0.05;
        group.current.rotation.y = Math.sin(t * 0.3) * 0.2;

        if (bones.current.Head_05) {
            bones.current.Head_05.rotation.x =
                baseHeadRotation.current.x + Math.sin(t * 1.6) * 0.03;
        }

        if (bones.current.UpperArmr_07)
            bones.current.UpperArmr_07.rotation.z =
                -0.4 + Math.sin(t * 1) * 0.05;

        if (bones.current.LowerArmr_08)
            bones.current.LowerArmr_08.rotation.z =
                -0.2 + Math.sin(t * 1.2) * 0.03;

        if (bones.current.UpperArml_015)
            bones.current.UpperArml_015.rotation.z =
                0.4 + Math.sin(t * 1.1) * 0.05;

        if (bones.current.LowerArml_016)
            bones.current.LowerArml_016.rotation.z =
                0.2 + Math.sin(t * 1.3) * 0.03;
    });

    return (
        <group ref={group} {...props} scale={1.6}>
            <primitive object={scene} />
        </group>
    );
}

useGLTF.preload("/astronaut.glb");