import { execSync } from 'child_process';

const envAssignments = Object.entries(process.env)
    .map(([key, value]) =>
        key.startsWith('MSS_') && value ? `${key}='${value}'` : undefined,
    )
    .filter((item) => item !== undefined);

// Build and tag the Docker image
export const buildImage = ({ imageName }: { imageName: string }) => {
    const buildArgs = envAssignments
        .map((item) => `--build-arg ${item}`)
        .join(' ');

    try {
        console.log('Building Docker image...');
        execSync(
            `docker build --progress=plain --squash ${buildArgs} -t ${imageName} -f template/bases/dist/docker/Dockerfile .`,
            {
                cwd: '../',
                stdio: 'inherit',
            },
        );
    } catch (error) {
        console.error('Error building Docker image:', error);
        process.exit(1);
    }
};
